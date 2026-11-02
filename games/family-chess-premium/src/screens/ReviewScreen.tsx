import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../state';
import { ChessBoard, type Arrow } from '../components/ChessBoard/ChessBoard';
import { Btn, TopBar, useFitSize } from '../components/ui';
import { Icon } from '../components/icons';
import { GameController } from '../game/gameController';
import { getEngine } from '../engine/stockfishAdapter';
import { REVIEW } from '../engine/difficulty';
import { formatEval, reviewMove, terminalScore, type MoveReview, type PositionEval } from '../engine/analysis';
import { sound } from '../audio/sound';
import { Chess } from 'chess.js';

const cache = new Map<string, { evals: PositionEval[]; reviews: MoveReview[]; depth: number }>();
const MARK: Record<string, string> = { best: '★', good: '✓', ok: '', inaccuracy: '?!', mistake: '?', blunder: '??' };

export function ReviewScreen({ gameId, ply }: { gameId: string; ply?: number }) {
  const app = useApp();
  const { t, profile, settings } = app;
  const saved = profile.games.find((g) => g.id === gameId);
  const parsed = useMemo(() => {
    if (!saved) return null;
    try {
      return GameController.fromPgn(saved.pgn).game;
    } catch {
      return null;
    }
  }, [saved]);
  const moves = parsed ? parsed.history() : [];
  const [idx, setIdx] = useState(ply ?? moves.length); // number of moves applied
  const [evals, setEvals] = useState<PositionEval[]>(() => cache.get(gameId)?.evals ?? []);
  const [reviews, setReviews] = useState<MoveReview[]>(() => cache.get(gameId)?.reviews ?? []);
  const [error, setError] = useState(false);
  const [line, setLine] = useState<{ fens: string[]; i: number; moves: string[] } | null>(null);
  const [showBest, setShowBest] = useState(true);
  const [boxRef, size] = useFitSize<HTMLDivElement>();
  const listRef = useRef<HTMLDivElement>(null);
  const engine = getEngine();
  const depth = settings.lowPower ? REVIEW.lowPowerDepth : REVIEW.depth;
  const total = moves.length + 1;

  // sequential analysis of every position with one fixed depth
  useEffect(() => {
    if (!parsed) return;
    let alive = true;
    const run = async () => {
      const fens = [parsed.startFen, ...moves.map((m) => m.fenAfter)];
      const out: PositionEval[] = [...(cache.get(gameId)?.evals ?? [])];
      try {
        for (let i = out.length; i < fens.length; i++) {
          if (!alive) return;
          const term = terminalScore(fens[i]);
          let ev: PositionEval;
          if (term) ev = { fen: fens[i], score: term, bestmove: null, pv: [], depth: 99 };
          else {
            const r = await engine.search({ fen: fens[i], depth, movetimeMs: REVIEW.movetimeCapMs }, () => !alive);
            if (!alive || r.cancelled) return;
            const l = r.lines[0];
            ev = { fen: fens[i], score: l?.score ?? { cp: 0 }, bestmove: r.bestmove, pv: l?.pv ?? (r.bestmove ? [r.bestmove] : []), depth: r.depth };
          }
          out.push(ev);
          const revs = moves.slice(0, out.length - 1).map((m, k) => reviewMove(k, m.uci, m.san, out[k], out[k + 1], REVIEW.minTrustedDepth));
          cache.set(gameId, { evals: [...out], reviews: revs, depth });
          setEvals([...out]);
          setReviews(revs);
        }
      } catch {
        if (alive) setError(true);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, gameId, error]);

  useEffect(() => {
    const el = listRef.current?.querySelector('.rvMove.cur');
    el?.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  useEffect(() => {
    if (!line || line.i >= line.fens.length - 1) return;
    const id = setTimeout(() => {
      sound.play('move', 0, 0.98);
      setLine((l) => (l ? { ...l, i: l.i + 1 } : l));
    }, line.i === 0 ? 350 : 900);
    return () => clearTimeout(id);
  }, [line]);

  if (!saved || !parsed) {
    return (
      <div className="screen">
        <TopBar title={t('review.title')} />
        <p className="empty">{t('review.noGames')}</p>
      </div>
    );
  }

  const fen = line ? line.fens[line.i] : idx === 0 ? parsed.startFen : moves[idx - 1].fenAfter;
  const cur = idx > 0 ? reviews[idx - 1] : undefined; // review of the move that led here
  const nextReview = reviews[idx]; // the move played from this position
  const evHere = evals[idx];
  const lastMv = line ? (line.i > 0 ? line.moves[line.i - 1] : null) : idx > 0 ? moves[idx - 1].uci : null;
  const arrows: Arrow[] = [];
  if (!line && showBest && nextReview && nextReview.bestUci && nextReview.bestUci !== nextReview.uci) {
    arrows.push({ from: nextReview.bestUci.slice(0, 2), to: nextReview.bestUci.slice(2, 4), kind: 'best' });
  }

  const go = (n: number) => {
    setLine(null);
    const k = Math.max(0, Math.min(moves.length, n));
    if (k !== idx && k > 0) sound.playMove(moves[k - 1]);
    setIdx(k);
  };

  const playLine = () => {
    if (!nextReview || !nextReview.pvUci.length) return;
    const c = new Chess(fen);
    const fens = [fen];
    for (const u of nextReview.pvUci) {
      try {
        c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
        fens.push(c.fen());
      } catch {
        break;
      }
    }
    setLine({ fens, i: 0, moves: nextReview.pvUci.slice(0, fens.length - 1) });
  };

  const counts = (c: 'w' | 'b') => {
    const r = reviews.filter((x) => x.color === c);
    return { i: r.filter((x) => x.verdict === 'inaccuracy').length, m: r.filter((x) => x.verdict === 'mistake').length, b: r.filter((x) => x.verdict === 'blunder').length };
  };
  const reasonText = (r: MoveReview) => {
    const rs = r.reason;
    const params: Record<string, string | number> = { ...(rs as Record<string, string | number>) };
    if (rs.key === 'losesPiece') params.piece = t(`pieces.${rs.piece}`);
    return t(`review.reason.${rs.key}`, params);
  };
  const done = evals.length >= total;
  const retryFrom = (k: number) => {
    const m = moves[k];
    if (!m) return;
    app.go({ name: 'game', mode: 'ai', startFen: m.fenBefore, playerColor: m.color, level: profile.aiLevel });
  };

  return (
    <div className="screen game review">
      <div className="boardArea" ref={boxRef}>
        {size > 0 && (
          <ChessBoard
            fen={fen}
            size={size}
            orientation={saved.playerColor ?? 'w'}
            movable={null}
            legalTargets={() => []}
            isPromotion={() => false}
            onMove={() => false}
            lastMove={lastMv ? { from: lastMv.slice(0, 2), to: lastMv.slice(2, 4) } : null}
            arrows={arrows}
            showCoords={settings.showCoords}
            checkSquare={(() => {
              const c = new Chess(fen);
              if (!c.inCheck()) return null;
              for (const row of c.board()) for (const p of row) if (p && p.type === 'k' && p.color === c.turn()) return p.square;
              return null;
            })()}
          />
        )}
      </div>
      <aside className="panel">
        <TopBar title={t('review.title')} />
        <div className="rvProgress" data-testid="review-progress">
          {error ? (
            <span className="engineError">
              {t('game.engineError')}{' '}
              <Btn size="sm" kind="gold" onClick={async () => { await engine.restart().catch(() => undefined); setError(false); }}>
                {t('game.engineRetry')}
              </Btn>
            </span>
          ) : done ? (
            t('review.analyzed', { depth })
          ) : (
            <>
              <span className="spinner" /> {t('review.analyzing', { done: evals.length, total })}
              <span className="bar"><i style={{ width: `${(evals.length / total) * 100}%` }} /></span>
            </>
          )}
        </div>
        <div className="rvSummary">
          {(['w', 'b'] as const).map((c) => (
            <div key={c}>{t('review.summary', { color: t(c === 'w' ? 'common.white' : 'common.black'), ...counts(c) })}</div>
          ))}
        </div>
        <div className="rvList" ref={listRef} data-testid="review-list">
          {moves.map((m, k) => {
            const r = reviews[k];
            return (
              <button key={k} className={`rvMove v-${r?.verdict ?? 'pending'}${idx === k + 1 ? ' cur' : ''}`} onClick={() => go(k + 1)}>
                {(m.color === 'w' || k === 0) && <span className="moveNo">{Math.floor((Number(parsed.startFen.split(' ')[5]) || 1) + (k + (parsed.startFen.split(' ')[1] === 'b' ? 1 : 0)) / 2)}{m.color === 'w' ? '.' : '…'}</span>}
                <span className="moveSan">{m.san}</span>
                {r && <span className="mark">{MARK[r.verdict]}{r.uncertain ? '?' : ''}</span>}
              </button>
            );
          })}
        </div>
        <div className="rvDetail" data-testid="review-detail">
          {cur ? (
            <>
              <div className={`verdict v-${cur.verdict}`}>
                {cur.san} · {t(`review.${cur.verdict}`)} {cur.uncertain && <small>{t('review.uncertain')}</small>}
              </div>
              <div className="reasonText">{reasonText(cur)}</div>
              {cur.uncertain && <div className="hintText">{t('review.uncertainNote')}</div>}
              <div className="evalLine">
                {t('review.eval')}: {formatEval(cur.before, cur.color)} → {formatEval(cur.after, cur.color)}
              </div>
              {cur.verdict !== 'best' && cur.bestSan && (
                <div className="rvActions">
                  <Btn size="sm" onClick={() => go(idx - 1)} icon={Icon.prev}>
                    {t('review.recommend')}: {cur.bestSan}
                  </Btn>
                  <Btn size="sm" kind="gold" onClick={() => retryFrom(idx - 1)} testId="retry-here">
                    {t('review.retryHere')}
                  </Btn>
                </div>
              )}
            </>
          ) : (
            evHere && <div className="evalLine">{t('review.eval')}: {formatEval(evHere.score, fen.split(' ')[1] as 'w' | 'b')}</div>
          )}
          {nextReview && nextReview.bestSan && (
            <div className="rvActions">
              <Btn size="sm" kind={showBest ? 'gold' : 'dark'} onClick={() => setShowBest((v) => !v)}>
                {t('review.showBest')}: {nextReview.bestSan}
              </Btn>
              <Btn size="sm" onClick={line ? () => setLine(null) : playLine} icon={line ? Icon.stop : Icon.play} testId="play-line">
                {line ? t('review.stopLine') : t('review.playLine')}
              </Btn>
            </div>
          )}
          {line && <div className="lineText">{nextReview?.pvSan.slice(0, line.i).join(' ')}</div>}
        </div>
        <div className="navRow">
          <Btn icon={Icon.first} onClick={() => go(0)}>{''}</Btn>
          <Btn icon={Icon.prev} onClick={() => go(idx - 1)} testId="rv-prev">{''}</Btn>
          <Btn icon={Icon.next} onClick={() => go(idx + 1)} testId="rv-next">{''}</Btn>
          <Btn icon={Icon.last} onClick={() => go(moves.length)}>{''}</Btn>
        </div>
      </aside>
    </div>
  );
}
