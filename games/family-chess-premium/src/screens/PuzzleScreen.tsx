import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { useApp } from '../state';
import { ChessBoard, type Arrow } from '../components/ChessBoard/ChessBoard';
import { Btn, LangToggle, Modal, TopBar, useFitSize } from '../components/ui';
import { Icon, Stars } from '../components/icons';
import { puzzleById, puzzleNumber } from '../academy/puzzles';
import { advance, judgeMove, playUci, solverColor, solverMoveCount, type PuzzleSession } from '../academy/puzzleValidator';
import { recordAttempt, starsFor } from '../academy/progressManager';
import { explanation, hint1, hint2, hintFocus, promptKey } from '../academy/puzzleText';
import { makeT, other } from '../i18n/i18n';
import { sound } from '../audio/sound';
import type { Puzzle } from '../academy/types';

type Phase = 'intro' | 'solving' | 'replying' | 'solved' | 'revealed';

export function PuzzleScreen({ id, list, daily }: { id: string; list: string[]; daily?: boolean }) {
  const app = useApp();
  const { t, lang, profile, settings, updateProfile, replace, feel } = app;
  const puzzle = puzzleById(id) as Puzzle;
  const [boxRef, size] = useFitSize<HTMLDivElement>();
  const session = useRef<PuzzleSession | null>(null);
  const [fen, setFen] = useState(puzzle.fen);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [mistakes, setMistakes] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [msg, setMsg] = useState<{ kind: 'info' | 'good' | 'bad'; text: string } | null>(null);
  const [flash, setFlash] = useState<{ square: string; kind: 'wrong' | 'right'; key: number } | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [attemptStars, setAttemptStars] = useState<number | null>(null);
  const touched = useRef(false);
  const recorded = useRef(false);
  const otherT = makeT(other(lang));
  const record = profile.puzzles[id];
  const color = solverColor(puzzle);

  const setFromChess = (c: Chess, u?: string) => {
    setFen(c.fen());
    setLast(u ? { from: u.slice(0, 2), to: u.slice(2, 4) } : null);
  };

  const start = useCallback(() => {
    const c = new Chess(puzzle.fen);
    session.current = { puzzle, chess: c, index: 0 };
    recorded.current = false;
    touched.current = false;
    setFen(puzzle.fen);
    setLast(null);
    setPhase('intro');
    setMistakes(0);
    setHintLevel(0);
    setAttemptStars(null);
    setMsg({ kind: 'info', text: t('solve.opponentMoving') });
    const timer = setTimeout(() => {
      const s = session.current!;
      const mv = playUci(s.chess, puzzle.moves[0]);
      s.index = 1;
      sound.playMove({ captured: mv.captured, isCastle: mv.isKingsideCastle() || mv.isQueensideCastle(), promotion: mv.promotion, isCheck: s.chess.inCheck(), isCheckmate: false });
      setFromChess(s.chess, puzzle.moves[0]);
      setPhase('solving');
      setMsg(null);
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);

  useEffect(() => start(), [start]);

  const saveAttempt = (solved: boolean, m = mistakes, h = hintLevel) => {
    if (recorded.current) return;
    recorded.current = true;
    updateProfile((p) => {
      const np = { ...p, puzzles: { ...p.puzzles, [id]: recordAttempt(p.puzzles[id], { solved, mistakes: m, hintsUsed: h }) } };
      if (daily && solved && np.daily && !np.daily.done.includes(id)) {
        np.daily = { ...np.daily, done: [...np.daily.done, id] };
        if (np.daily.done.length >= np.daily.ids.length && !np.daily.celebrated) {
          np.daily = { ...np.daily, celebrated: true };
          setTimeout(() => setCelebrate(true), 900);
        }
      }
      return np;
    });
  };

  // leaving / restarting an attempt that was started but not solved counts as unsolved
  const abandon = () => {
    if ((touched.current || hintLevel > 0) && !recorded.current) saveAttempt(false);
  };
  useEffect(() => {
    app.backGuard.current = () => {
      abandon();
      return false;
    };
    return () => {
      app.backGuard.current = null;
    };
  });

  const onMove = (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
    const s = session.current;
    if (!s || phase !== 'solving') return false;
    touched.current = true;
    const legal = new Chess(s.chess.fen());
    let mv;
    try {
      mv = legal.move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return false;
    }
    const uci = mv.from + mv.to + (mv.promotion ?? '');
    const verdict = judgeMove(s, uci);
    if (verdict === 'wrong' || verdict === 'illegal') {
      setMistakes((m) => m + 1);
      sound.play('wrong');
      feel('light');
      setFlash({ square: to, kind: 'wrong', key: Date.now() });
      setMsg({ kind: 'bad', text: t('solve.wrong') });
      return false;
    }
    sound.playMove({ captured: mv.captured, isCastle: mv.isKingsideCastle() || mv.isQueensideCastle(), promotion: mv.promotion, isCheck: legal.inCheck(), isCheckmate: legal.isCheckmate() });
    feel(mv.captured ? 'medium' : 'light');
    if (verdict === 'solved') {
      playUci(s.chess, uci);
      s.index = puzzle.moves.length;
      setFromChess(s.chess, uci);
      setPhase('solved');
      const stars = starsFor({ solved: true, mistakes, hintsUsed: hintLevel });
      setAttemptStars(stars);
      setMsg({ kind: 'good', text: t('solve.solved') });
      sound.play('solved', legal.isCheckmate() ? 1300 : 250);
      saveAttempt(true);
      return true;
    }
    // correct intermediate move: opponent replies
    const reply = advance(s, uci);
    const afterMine = new Chess(s.chess.fen());
    if (reply) afterMine.undo();
    setFen(afterMine.fen());
    setLast({ from, to });
    setPhase('replying');
    setHintLevel((h) => (h >= 3 ? 2 : h)); // hint arrow belonged to the previous step
    setMsg({ kind: 'good', text: t('solve.correct') });
    sound.play('correct', 150);
    setTimeout(() => {
      if (reply) {
        const c = s.chess;
        const hist = c.history({ verbose: true });
        const lm = hist[hist.length - 1];
        sound.playMove({ captured: lm?.captured, isCastle: false, promotion: lm?.promotion, isCheck: c.inCheck(), isCheckmate: false });
        setFromChess(c, reply);
      }
      setPhase('solving');
    }, 650);
    return true;
  };

  const reveal = () => {
    const s = session.current;
    if (!s) return;
    saveAttempt(false);
    setPhase('revealed');
    setMsg({ kind: 'info', text: t('solve.revealed') });
    const steps = puzzle.moves.slice(s.index);
    steps.forEach((u, i) =>
      setTimeout(() => {
        const mv = playUci(s.chess, u);
        s.index++;
        sound.playMove({ captured: mv.captured, isCastle: false, promotion: mv.promotion, isCheck: s.chess.inCheck(), isCheckmate: s.chess.isCheckmate() });
        setFromChess(s.chess, u);
      }, 500 + i * 850),
    );
  };

  const nextId = list[(list.indexOf(id) + 1) % list.length];
  const goNext = () => {
    abandon();
    if (daily) {
      const d = profile.daily;
      const remaining = d ? d.ids.filter((x) => !d.done.includes(x) && x !== id) : [];
      if (remaining.length) replace({ name: 'puzzle', id: remaining[0], list, daily });
      else app.back();
      return;
    }
    replace({ name: 'puzzle', id: nextId, list, daily });
  };

  const s = session.current;
  const expected = s && phase === 'solving' ? puzzle.moves[s.index] : null;
  const arrows: Arrow[] = [];
  if (hintLevel >= 3 && expected) arrows.push({ from: expected.slice(0, 2), to: expected.slice(2, 4), kind: 'hint' });
  const firstStep = !!s && s.index <= 1;
  const highlights = hintLevel >= 2 && phase === 'solving' && expected ? hintFocus(puzzle, expected, firstStep) : [];
  const fav = profile.favorites.includes(id);
  const total = solverMoveCount(puzzle);
  const checkSq = (() => {
    const c = new Chess(fen);
    if (!c.inCheck()) return null;
    for (const row of c.board()) for (const p of row) if (p && p.type === 'k' && p.color === c.turn()) return p.square;
    return null;
  })();
  const pk = promptKey(puzzle);

  return (
    <div className="screen game puzzle">
      <div className="boardArea" ref={boxRef}>
        {size > 0 && (
          <ChessBoard
            fen={fen}
            size={size}
            orientation={color}
            movable={phase === 'solving' ? color : null}
            legalTargets={(sq) => new Chess(fen).moves({ square: sq, verbose: true }).map((m) => m.to)}
            isPromotion={(a, b) => new Chess(fen).moves({ square: a, verbose: true }).some((m) => m.to === b && !!m.promotion)}
            onMove={onMove}
            onSelect={() => {
              sound.unlock();
              sound.play('select');
            }}
            lastMove={last}
            checkSquare={checkSq}
            highlights={highlights}
            arrows={arrows}
            flash={flash}
            showCoords={settings.showCoords}
            animMs={settings.lowPower ? 90 : 170}
          />
        )}
      </div>
      <aside className="panel">
        <TopBar
          title={t('puzzles.number', { n: puzzleNumber(id) })}
          onBack={() => {
            abandon();
            app.back();
          }}
          right={
            <>
            <LangToggle compact />
            <button
              className={`iconBtn fav${fav ? ' on' : ''}`}
              data-testid="fav"
              aria-label={t(fav ? 'puzzles.favRemove' : 'puzzles.favAdd')}
              onClick={() => {
                app.click();
                updateProfile((p) => ({ ...p, favorites: fav ? p.favorites.filter((x) => x !== id) : [...p.favorites, id] }));
              }}
            >
              {Icon.heart}
            </button>
            </>
          }
        />
        <div className="pzMeta">
          <span className="tag">{t(`puzzles.cat.${puzzle.category}`)}</span>
          <span className={`tag d-${puzzle.difficulty}`}>{t(`puzzles.difficulty.${puzzle.difficulty}`)}</span>
          {puzzle.rating && <span className="tag" title={puzzle.source}>Lichess {puzzle.rating}</span>}
          <span className="pzBest">
            {t('solve.best')} <Stars n={record?.best ?? 0} size="1.05em" />
          </span>
        </div>
        <div className="pzToMove">
          <img src={`pieces/${color}K.svg`} alt="" />
          {t('solve.toMove', { color: t(color === 'w' ? 'common.white' : 'common.black') })}
          {total > 1 && <small> · {s ? Math.min(total, Math.ceil(s.index / 2)) : 0}/{total}</small>}
        </div>
        <p className="pzPrompt" data-testid="prompt">{t(`solve.prompt.${pk}`)}</p>
        {settings.showOtherLang && <p className="otherLang">{otherT(`solve.prompt.${pk}`)}</p>}
        {msg && (
          <div className={`pzMsg ${msg.kind}`} data-testid="pz-msg">
            {msg.text}
          </div>
        )}
        {phase === 'solved' && (
          <div className="pzSolved" data-testid="pz-solved">
            <Stars n={attemptStars ?? 0} size="1.6em" />
            <div>{t(attemptStars === 3 ? 'solve.stars3' : attemptStars === 2 ? 'solve.stars2' : 'solve.stars1')}</div>
          </div>
        )}
        {(phase === 'solved' || phase === 'revealed') && (
          <div className="pzExplain">
            <b>{t('solve.explain')}</b> {explanation(t, lang, puzzle)}
            {settings.showOtherLang && <div className="otherLang">{explanation(otherT, other(lang), puzzle)}</div>}
          </div>
        )}
        {(phase === 'solving' || phase === 'replying') && hintLevel > 0 && (
          <div className="pzHints" data-testid="hints">
            {expected && <div>💡 {hint1(t, puzzle, fen, expected)}</div>}
            {hintLevel >= 2 && expected && <div>💡 {hint2(t, lang, puzzle, fen, expected, firstStep)}</div>}
            {hintLevel >= 3 && expected && <div>💡 {t('solve.hint3', { from: expected.slice(0, 2), to: expected.slice(2, 4) })}</div>}
          </div>
        )}
        <div className="spacer" />
        <div className="controls">
          {phase === 'solving' && hintLevel < 3 && (
            <Btn icon={Icon.bulb} onClick={() => setHintLevel((h) => h + 1)} testId="hint">
              {t('solve.hintN', { n: hintLevel + 1 })}
            </Btn>
          )}
          {phase === 'solving' && (mistakes > 0 || hintLevel >= 3) && (
            <Btn kind="ghost" onClick={reveal} testId="reveal">
              {t('solve.showSolution')}
            </Btn>
          )}
          <Btn icon={Icon.restart} onClick={() => { abandon(); start(); }} testId="restart">
            {t('solve.restart')}
          </Btn>
          <Btn kind={phase === 'solved' ? 'gold' : 'dark'} icon={Icon.next} onClick={goNext} testId="next">
            {t('solve.next')}
          </Btn>
        </div>
      </aside>
      {celebrate && (
        <Modal title={t('academy.dailyDone')} onClose={() => setCelebrate(false)} actions={<Btn kind="gold" onClick={() => { setCelebrate(false); app.back(); }}>{t('common.ok')}</Btn>}>
          <div className="celebrate" data-testid="celebrate">
            <div className="medal">
              <Stars n={3} size="2.4em" />
            </div>
            <p>{t('academy.dailyCelebrate')}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
