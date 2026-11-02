import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import { useApp, type Screen } from '../state';
import { ChessBoard } from '../components/ChessBoard/ChessBoard';
import { Btn, Confirm, Modal, SettingsButton, Toggle, useFitSize } from '../components/ui';
import { Icon } from '../components/icons';
import { GameController, START_FEN, type MoveRecord } from '../game/gameController';
import { getEngine, type EngineStatus } from '../engine/stockfishAdapter';
import { levelConfig, LEVELS } from '../engine/difficulty';
import { sound } from '../audio/sound';
import { onLifecycle, saveTextFile, pickTextFile } from '../platform/native';
import { addGame, makeSavedGame } from '../game/gameHistory';
import { SetupModal } from './SetupModal';

type GameScreenProps = Extract<Screen, { name: 'game' }>;
const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function capturedBy(history: readonly MoveRecord[]) {
  const out = { w: [] as string[], b: [] as string[] };
  for (const m of history) if (m.captured) out[m.color].push(m.captured);
  const order = 'qrbnp';
  out.w.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  out.b.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return out;
}

export function GameScreen(props: GameScreenProps) {
  const app = useApp();
  const { t, profile, settings, updateProfile, toast, feel, backGuard } = app;
  const engine = getEngine();

  // ----- game setup (new / resumed / from a position) -----
  const init = useMemo(() => {
    const ip = props.resume ? profile.inProgress : null;
    if (ip && ip.mode === props.mode) {
      try {
        return { g: new GameController(ip.startFen, ip.moves), level: ip.level ?? profile.aiLevel, playerColor: ip.playerColor ?? 'w', flipped: ip.flipped };
      } catch {
        /* corrupted save: start fresh */
      }
    }
    return {
      g: new GameController(props.startFen ?? START_FEN),
      level: props.level ?? profile.aiLevel,
      playerColor: props.playerColor ?? 'w',
      flipped: false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const game = useRef(init.g);
  const g = game.current;
  const isAI = props.mode === 'ai';
  const level = init.level;
  const playerColor: 'w' | 'b' = init.playerColor;
  const aiColor = playerColor === 'w' ? 'b' : 'w';
  const [, rerender] = useReducer((x: number) => x + 1, 0);
  const [orientation, setOrientation] = useState<'w' | 'b'>(() => {
    const base = isAI ? playerColor : 'w';
    return init.flipped ? (base === 'w' ? 'b' : 'w') : base;
  });
  const [thinking, setThinking] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>(engine.status);
  const [modal, setModal] = useState<null | 'more' | 'new' | 'resign' | 'draw' | 'over' | 'setup'>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const searchGen = useRef(0);
  const [boxRef, boardSize] = useFitSize<HTMLDivElement>();

  const result = g.result();
  const turn = g.turn();
  const last = g.lastMove();
  const history = g.history();

  useEffect(() => engine.onStatus(setEngineStatus), [engine]);

  // ----- persistence of the running game -----
  const persist = useCallback(() => {
    const gg = game.current;
    updateProfile((p) => ({
      ...p,
      inProgress:
        gg.result() || gg.history().length === 0
          ? null
          : {
              mode: props.mode,
              startFen: gg.startFen,
              moves: gg.uciMoves(),
              level,
              playerColor,
              flipped: orientation !== (isAI ? playerColor : 'w'),
              savedAt: new Date().toISOString(),
            },
    }));
  }, [updateProfile, props.mode, level, playerColor, orientation, isAI]);

  const finish = useCallback(() => {
    const gg = game.current;
    const r = gg.result();
    if (!r) return;
    if (r.winner === null) sound.play('draw', 300);
    const names = isAI
      ? { w: playerColor === 'w' ? profile.name : `Stockfish L${level}`, b: playerColor === 'b' ? profile.name : `Stockfish L${level}` }
      : { w: `${profile.name} (${t('common.white')})`, b: t('common.black') };
    const saved = makeSavedGame(gg, props.mode, { level: isAI ? level : undefined, playerColor: isAI ? playerColor : undefined, names });
    setSavedId(saved.id);
    updateProfile((p) => ({ ...addGame(p, saved, isAI ? { playerColor } : undefined), inProgress: null }));
    setTimeout(() => setModal('over'), r.kind === 'checkmate' ? 900 : 400);
  }, [isAI, playerColor, level, profile.name, props.mode, t, updateProfile]);

  const afterMove = useCallback(
    (rec: MoveRecord) => {
      sound.playMove(rec);
      feel(rec.isCheckmate ? 'heavy' : rec.captured ? 'medium' : 'light');
      if (!isAI && settings.autoRotate && !game.current.result()) setOrientation(game.current.turn());
      rerender();
      if (game.current.result()) finish();
      else persist();
    },
    [feel, finish, persist, isAI, settings.autoRotate],
  );

  // ----- computer move -----
  const requestAiMove = useCallback(async () => {
    const gg = game.current;
    if (!isAI || gg.result() || gg.turn() !== aiColor) return;
    const gen = ++searchGen.current;
    const fen = gg.fen();
    const cfg = levelConfig(level, settings.lowPower);
    setThinking(true);
    const started = performance.now();
    try {
      const res = await engine.search(
        { fen, depth: cfg.depth, movetimeMs: cfg.movetimeMs, skill: cfg.skill, limitElo: cfg.fallbackElo },
        () => gen !== searchGen.current,
      );
      const wait = cfg.minThinkMs - (performance.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (gen !== searchGen.current || res.cancelled || gg.fen() !== fen) return; // stale: game changed meanwhile
      if (!res.bestmove) throw new Error('no bestmove');
      const rec = gg.move(GameController.parseUci(res.bestmove));
      if (!rec) throw new Error(`engine move rejected: ${res.bestmove}`);
      afterMove(rec);
    } catch {
      if (gen === searchGen.current) toast(t('game.engineError'));
    } finally {
      if (gen === searchGen.current) setThinking(false);
    }
  }, [isAI, aiColor, level, settings.lowPower, engine, afterMove, toast, t]);

  const cancelSearch = () => {
    searchGen.current++;
    engine.stop();
    setThinking(false);
  };

  useEffect(() => {
    if (!isAI) return;
    void engine.newGame().catch(() => undefined);
    void requestAiMove();
    return () => {
      searchGen.current++;
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pause / resume: stop thinking in the background, save, continue on return
  useEffect(
    () =>
      onLifecycle(
        () => {
          if (thinking) cancelSearch();
          sound.suspend();
          persist();
        },
        () => {
          if (isAI && !game.current.result() && game.current.turn() === aiColor) void requestAiMove();
        },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thinking, persist, requestAiMove],
  );

  useEffect(() => {
    backGuard.current = () => {
      if (modal) {
        setModal(null);
        return true;
      }
      persist();
      return false;
    };
    return () => {
      backGuard.current = null;
    };
  }, [modal, persist, backGuard]);

  // ----- user moves -----
  const onMove = (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (isAI && (turn !== playerColor || thinking)) return false;
    const rec = g.move({ from, to, promotion });
    if (!rec) return false;
    afterMove(rec);
    if (isAI && !g.result()) setTimeout(() => void requestAiMove(), 30);
    return true;
  };

  const undo = () => {
    if (!history.length) {
      toast(t('game.noUndo'));
      return;
    }
    if (isAI) {
      if (thinking) {
        cancelSearch();
        g.undo();
      } else {
        g.undo();
        if (g.turn() !== playerColor) g.undo();
      }
      if (g.turn() !== playerColor && !g.history().length) {
        // the computer played the first move: let it play again
        setTimeout(() => void requestAiMove(), 30);
      }
    } else {
      g.undo();
      if (settings.autoRotate) setOrientation(g.turn());
    }
    setModal(null);
    sound.play('move', 0, 0.9);
    rerender();
    persist();
  };

  const newGame = () => {
    if (isAI) {
      setModal('setup');
      return;
    }
    cancelSearch();
    game.current = new GameController();
    setOrientation('w');
    setModal(null);
    updateProfile((p) => ({ ...p, inProgress: null }));
    rerender();
  };

  const statusText = () => {
    if (result) return t(result.winner ? (result.winner === 'w' ? 'game.result.whiteWins' : 'game.result.blackWins') : 'game.result.draw');
    if (thinking) return t('game.aiThinking');
    if (g.inCheck()) return t('game.check');
    if (isAI) return turn === playerColor ? t('game.yourTurn') : t(turn === 'w' ? 'game.turnW' : 'game.turnB');
    return t(turn === 'w' ? 'game.turnW' : 'game.turnB');
  };

  const caps = capturedBy(history);
  const material = caps.w.reduce((s, p) => s + VALUE[p], 0) - caps.b.reduce((s, p) => s + VALUE[p], 0);
  const lvlName = t(`setup.levels.${LEVELS[level - 1].key}`);
  const nameOf = (c: 'w' | 'b') => {
    if (!isAI) return t(c === 'w' ? 'common.white' : 'common.black');
    return c === playerColor ? `${t('game.you')} · ${profile.name}` : `${t('common.computer')} · ${t('game.level', { level, name: lvlName })}`;
  };
  const playerCard = (c: 'w' | 'b') => {
    const mine = caps[c];
    const adv = c === 'w' ? material : -material;
    return (
      <div className={`playerCard${turn === c && !result ? ' active' : ''}`} data-testid={`player-${c}`}>
        <img className="playerPiece" src={`pieces/${c}K.svg`} alt="" />
        <div className="playerInfo">
          <div className="playerName">{nameOf(c)}</div>
          <div className="captured">
            {mine.map((p, i) => (
              <img key={i} src={`pieces/${c === 'w' ? 'b' : 'w'}${p.toUpperCase()}.svg`} alt={p} />
            ))}
            {adv > 0 && <span className="adv">+{adv}</span>}
          </div>
        </div>
        {turn === c && !result && <span className={`turnDot${thinking && c === aiColor ? ' thinking' : ''}`} />}
      </div>
    );
  };

  const moveRows = [];
  const startBlack = g.startFen.split(' ')[1] === 'b';
  const plies = history.map((h) => h.san);
  if (startBlack) plies.unshift('…');
  for (let i = 0; i < plies.length; i += 2) moveRows.push([plies[i], plies[i + 1]]);
  const moveNoBase = Number(g.startFen.split(' ')[5]) || 1;
  const claim = g.claimableDraw();
  const top = orientation === 'w' ? 'b' : 'w';
  const bottom = orientation;

  const exportPgn = async () => {
    try {
      const r = await saveTextFile(`family-chess-${Date.now()}.pgn`, g.pgn({ Date: new Date().toISOString().slice(0, 10).replace(/-/g, '.') }), 'application/x-chess-pgn');
      toast(`${t('game.saved')} · ${r.where}`);
    } catch {
      toast(t('settings.exportFail'));
    }
    setModal(null);
  };
  const importPgn = async () => {
    setModal(null);
    const text = await pickTextFile('.pgn,text/plain,application/x-chess-pgn');
    if (!text) return;
    try {
      const { game: lg, headers } = GameController.fromPgn(text);
      const saved = makeSavedGame(lg, 'two', { names: { w: headers.White ?? '?', b: headers.Black ?? '?' } });
      saved.pgn = text;
      updateProfile((p) => ({ ...p, games: [saved, ...p.games].slice(0, 40) }));
      toast(t('game.loaded'));
      app.go({ name: 'review', gameId: saved.id });
    } catch {
      toast(t('game.pgnInvalid'));
    }
  };

  return (
    <div className="screen game">
      <div className="boardArea" ref={boxRef}>
        {boardSize > 0 && (
          <ChessBoard
            fen={g.fen()}
            size={boardSize}
            orientation={orientation}
            movable={result ? null : isAI ? (turn === playerColor && !thinking ? playerColor : null) : 'both'}
            legalTargets={(sq) => g.legalTargets(sq)}
            isPromotion={(a, b) => g.isPromotion(a, b)}
            onMove={onMove}
            onSelect={() => {
              sound.unlock();
              sound.play('select');
            }}
            onIllegal={() => {
              sound.play('illegal');
              toast(g.inCheck() ? t('game.mustEscape') : t('game.illegal'));
            }}
            onTouchLocked={(sq) => {
              const pc = g.get(sq);
              if (pc && !result && !thinking && pc.color !== turn) toast(t('game.notYourPiece', { color: t(turn === 'w' ? 'common.white' : 'common.black') }));
            }}
            lastMove={last ? { from: last.from, to: last.to } : null}
            checkSquare={g.checkSquare()}
            showCoords={settings.showCoords}
            animMs={settings.lowPower ? 90 : 160}
          />
        )}
      </div>
      <aside className="panel">
        <div className="panelHead">
          <button className="iconBtn" data-testid="game-home" aria-label="home" onClick={() => { app.click(); persist(); app.home(); }}>
            {Icon.home}
          </button>
          <div className="panelTitle">{isAI ? t('game.aiTitle') : t('game.twoTitle')}</div>
          <SettingsButton />
        </div>
        {playerCard(top)}
        <div className={`status${g.inCheck() && !result ? ' check' : ''}${thinking ? ' thinking' : ''}`} data-testid="status">
          {thinking && <span className="spinner" />}
          {statusText()}
        </div>
        {isAI && engineStatus === 'loading' && <div className="engineNote">{t('game.engineLoading')}</div>}
        {isAI && engineStatus === 'error' && (
          <div className="engineError" data-testid="engine-error">
            <span>{t('game.engineError')}</span>
            <Btn kind="gold" size="sm" onClick={async () => { await engine.restart().catch(() => undefined); void requestAiMove(); }}>
              {t('game.engineRetry')}
            </Btn>
          </div>
        )}
        {claim && (
          <div className="claimBox">
            <span>{t(claim === 'threefold' ? 'game.claimThreefold' : 'game.claimFifty')}</span>
            <Btn kind="gold" size="sm" testId="claim-draw" onClick={() => { g.claimDraw(); rerender(); finish(); }}>
              {t('game.claimDraw')}
            </Btn>
          </div>
        )}
        <div className="moveList" data-testid="move-list" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
          {moveRows.map((r, i) => (
            <div className="moveRow" key={i}>
              <span className="moveNo">{moveNoBase + i}.</span>
              <span className="moveSan">{r[0]}</span>
              <span className="moveSan">{r[1] ?? ''}</span>
            </div>
          ))}
        </div>
        {playerCard(bottom)}
        <div className="controls">
          <Btn icon={Icon.undo} onClick={undo} testId="undo" disabled={!history.length || !!result}>
            {t('game.undo')}
          </Btn>
          <Btn icon={Icon.plus} onClick={() => (history.length && !result ? setModal('new') : newGame())} testId="new-game">
            {t('game.newGame')}
          </Btn>
          <Btn icon={Icon.flip} onClick={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))} testId="flip">
            {t('game.flip')}
          </Btn>
          <Btn icon={Icon.more} onClick={() => setModal('more')} testId="more">
            {t('common.more')}
          </Btn>
        </div>
      </aside>

      {modal === 'more' && (
        <Modal title={t('common.more')} onClose={() => setModal(null)} actions={<Btn onClick={() => setModal(null)}>{t('common.close')}</Btn>}>
          <div className="menuList">
            {!result && (
              <Btn icon={Icon.flag} kind="ghost" onClick={() => setModal('resign')} testId="resign">
                {t('game.resign')}
              </Btn>
            )}
            {!result && !isAI && (
              <Btn icon={Icon.handshake} kind="ghost" onClick={() => setModal('draw')} testId="offer-draw">
                {t('game.offerDraw')}
              </Btn>
            )}
            <Btn icon={Icon.save} kind="ghost" onClick={exportPgn} testId="save-pgn">
              {t('game.savePgn')}
            </Btn>
            <Btn icon={Icon.folder} kind="ghost" onClick={importPgn} testId="load-pgn">
              {t('game.loadPgn')}
            </Btn>
            {!isAI && (
              <div className="settingRow">
                <span>{t('game.autoRotate')}</span>
                <Toggle on={settings.autoRotate} onChange={(v) => { app.updateSettings({ autoRotate: v }); if (v) setOrientation(g.turn()); }} />
              </div>
            )}
          </div>
        </Modal>
      )}
      {modal === 'new' && <Confirm text={t('game.confirmNew')} onYes={newGame} onNo={() => setModal(null)} />}
      {modal === 'setup' && <SetupModal replace onClose={() => setModal(null)} />}
      {modal === 'resign' && (
        <Confirm
          text={t('game.confirmResign')}
          onYes={() => {
            cancelSearch();
            g.resign(isAI ? playerColor : turn);
            setModal(null);
            rerender();
            finish();
          }}
          onNo={() => setModal(null)}
        />
      )}
      {modal === 'draw' && (
        <Confirm
          text={t('game.confirmDraw')}
          onYes={() => {
            g.agreeDraw();
            setModal(null);
            rerender();
            finish();
          }}
          onNo={() => setModal(null)}
        />
      )}
      {modal === 'over' && result && (
        <Modal
          title={
            isAI
              ? result.winner === null
                ? t('game.result.draw')
                : result.winner === playerColor
                  ? t('game.result.youWin')
                  : t('game.result.youLose')
              : t(result.winner ? (result.winner === 'w' ? 'game.result.whiteWins' : 'game.result.blackWins') : 'game.result.draw')
          }
          onClose={() => setModal(null)}
          actions={
            <>
              <Btn kind="ghost" icon={Icon.home} onClick={() => app.home()}>
                {t('common.home')}
              </Btn>
              <Btn onClick={newGame} icon={Icon.plus} testId="again">
                {t('game.again')}
              </Btn>
              {savedId && (
                <Btn kind="gold" size="lg" onClick={() => app.replace({ name: 'review', gameId: savedId })} testId="go-review">
                  {t('game.review')}
                </Btn>
              )}
            </>
          }
        >
          <div className="resultBody" data-testid="result">
            <div className="resultReason">{t(`game.result.${result.kind}`)}</div>
            <div className="resultScore">{result.winner === 'w' ? '1 – 0' : result.winner === 'b' ? '0 – 1' : '½ – ½'}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
