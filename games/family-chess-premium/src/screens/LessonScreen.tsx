import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { useApp } from '../state';
import { ChessBoard, type Arrow } from '../components/ChessBoard/ChessBoard';
import { Btn, LangToggle, TopBar, useFitSize } from '../components/ui';
import { Icon } from '../components/icons';
import { lessonById } from '../academy/lessons';
import { stepStartFen } from '../academy/lessons/fen';
import { bi, other } from '../i18n/i18n';
import { sound } from '../audio/sound';


function sanToUci(fen: string, san: string): string | null {
  try {
    const c = new Chess(fen);
    const m = c.move(san);
    return m.from + m.to + (m.promotion ?? '');
  } catch {
    return null;
  }
}

export function LessonScreen({ id }: { id: string }) {
  const app = useApp();
  const { t, lang, settings, profile, updateProfile, feel } = app;
  const lesson = lessonById(id)!;
  const [stepIdx, setStepIdx] = useState(() => Math.min(profile.lessons[id]?.completed ? 0 : (profile.lessons[id]?.lastStep ?? 0), lesson.steps.length - 1));
  const step = lesson.steps[stepIdx];
  const startFen = useMemo(() => stepStartFen(step), [step]);
  const [fen, setFen] = useState(startFen);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [taskDone, setTaskDone] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const [detail, setDetail] = useState(false);
  const [flash, setFlash] = useState<{ square: string; kind: 'wrong' | 'right'; key: number } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [boxRef, size] = useFitSize<HTMLDivElement>();

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    clearTimers();
    setFen(startFen);
    setLast(null);
    setTaskDone(!step.task);
    setMsg(null);
    setDetail(false);
    setShowAnswer(false);
    updateProfile((p) => ({ ...p, lessons: { ...p.lessons, [id]: { completed: p.lessons[id]?.completed ?? false, completedAt: p.lessons[id]?.completedAt ?? null, lastStep: stepIdx } } }));
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, startFen]);

  const playDemo = () => {
    if (!step.demo) return;
    clearTimers();
    const c = new Chess(startFen);
    setFen(startFen);
    setLast(null);
    step.demo.split(' ').filter(Boolean).forEach((san, i) => {
      timers.current.push(
        setTimeout(() => {
          const m = c.move(san);
          sound.playMove({ captured: m.captured, isCastle: m.isKingsideCastle() || m.isQueensideCastle(), promotion: m.promotion, isCheck: c.inCheck(), isCheckmate: c.isCheckmate() });
          setFen(c.fen());
          setLast({ from: m.from, to: m.to });
        }, 300 + i * 900),
      );
    });
  };

  const onMove = (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (!step.task || taskDone) return false;
    const c = new Chess(fen);
    let m;
    try {
      m = c.move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return false;
    }
    const ok = step.task.accept.some((s) => s.replace(/[+#]/g, '') === m.san.replace(/[+#]/g, '')) || (!!step.task.mate && c.isCheckmate());
    if (!ok) {
      sound.play('wrong');
      feel('light');
      setFlash({ square: to, kind: 'wrong', key: Date.now() });
      const special = step.task.wrong?.[m.san] ?? step.task.wrong?.[m.san.replace(/[+#]/g, '')];
      setMsg({ kind: 'bad', text: special ? bi(lang, special) : t('lesson.tryAgain') });
      return false;
    }
    sound.playMove({ captured: m.captured, isCastle: m.isKingsideCastle() || m.isQueensideCastle(), promotion: m.promotion, isCheck: c.inCheck(), isCheckmate: c.isCheckmate() });
    if (!c.isCheckmate()) sound.play('correct', 200);
    setFen(c.fen());
    setLast({ from: m.from, to: m.to });
    setTaskDone(true);
    setMsg({ kind: 'good', text: bi(lang, step.task.success) });
    if (step.task.reply) {
      const reply = step.task.reply;
      timers.current.push(
        setTimeout(() => {
          const r = c.move(reply);
          sound.playMove({ captured: r.captured, isCastle: r.isKingsideCastle() || r.isQueensideCastle(), promotion: r.promotion, isCheck: c.inCheck(), isCheckmate: false });
          setFen(c.fen());
          setLast({ from: r.from, to: r.to });
        }, 900),
      );
    }
    return true;
  };

  const isLast = stepIdx === lesson.steps.length - 1;
  const finish = () => {
    sound.play('solved');
    updateProfile((p) => ({ ...p, lessons: { ...p.lessons, [id]: { completed: true, completedAt: new Date().toISOString(), lastStep: 0 } } }));
    app.toast(t('lesson.complete'));
    app.back();
  };

  const arrows: Arrow[] = (step.arrows ?? []).map(([a, b]) => ({ from: a, to: b, kind: 'line' }));
  if (showAnswer && step.task && !taskDone) {
    const u = sanToUci(startFen, step.task.accept[0]);
    if (u) arrows.push({ from: u.slice(0, 2), to: u.slice(2, 4), kind: 'hint' });
  }
  const turn = fen.split(' ')[1] as 'w' | 'b';
  const orientation = step.orientation ?? (step.task ? (startFen.split(' ')[1] as 'w' | 'b') : 'w');
  const checkSq = (() => {
    const c = new Chess(fen);
    if (!c.inCheck()) return null;
    for (const row of c.board()) for (const p of row) if (p && p.type === 'k' && p.color === c.turn()) return p.square;
    return null;
  })();

  return (
    <div className="screen game lesson">
      <div className="boardArea" ref={boxRef}>
        {size > 0 && (
          <ChessBoard
            fen={fen}
            size={size}
            orientation={orientation}
            movable={step.task && !taskDone ? turn : null}
            legalTargets={(sq) => new Chess(fen).moves({ square: sq, verbose: true }).map((m) => m.to)}
            isPromotion={(a, b) => new Chess(fen).moves({ square: a, verbose: true }).some((m) => m.to === b && !!m.promotion)}
            onMove={onMove}
            onSelect={() => {
              sound.unlock();
              sound.play('select');
            }}
            lastMove={last}
            highlights={step.highlights}
            arrows={arrows}
            checkSquare={checkSq}
            flash={flash}
            showCoords={settings.showCoords}
            animMs={settings.lowPower ? 90 : 170}
          />
        )}
      </div>
      <aside className="panel">
        <TopBar title={bi(lang, lesson.title)} right={<><span className="stepCount">{t('lesson.step', { n: stepIdx + 1, total: lesson.steps.length })}</span><LangToggle compact /></>} />
        <div className="lessonBody">
          <p className="lessonMain" data-testid="lesson-text">{bi(lang, step.text)}</p>
          {settings.showOtherLang && <p className="otherLang">{bi(other(lang), step.text)}</p>}
          {step.detail && (
            <>
              <button className="detailToggle" onClick={() => { app.click(); setDetail((d) => !d); }}>
                {detail ? t('common.hideDetail') : t('common.detail')}
              </button>
              {detail && <p className="lessonDetail">{bi(lang, step.detail)}</p>}
            </>
          )}
          {step.task && !taskDone && <div className="taskNote">{Icon.play} {t('lesson.yourTurn')}</div>}
          {msg && <div className={`pzMsg ${msg.kind}`} data-testid="lesson-msg">{msg.text}</div>}
        </div>
        <div className="spacer" />
        <div className="controls">
          {step.demo && (
            <Btn icon={Icon.play} onClick={playDemo} testId="demo">
              {t('lesson.showMove')}
            </Btn>
          )}
          {step.task && !taskDone && (
            <Btn icon={Icon.bulb} onClick={() => setShowAnswer(true)} testId="lesson-hint">
              {t('solve.hint')}
            </Btn>
          )}
          {(step.demo || (step.task && taskDone)) && (
            <Btn icon={Icon.restart} onClick={() => { clearTimers(); setFen(startFen); setLast(null); setTaskDone(!step.task); setMsg(null); }}>
              {t('lesson.replay')}
            </Btn>
          )}
          <Btn icon={Icon.prev} onClick={() => setStepIdx((i) => Math.max(0, i - 1))} disabled={stepIdx === 0} testId="step-prev">
            {t('common.prev')}
          </Btn>
          {isLast ? (
            <Btn kind="gold" icon={Icon.check} onClick={finish} disabled={!taskDone} testId="lesson-finish">
              {t('lesson.complete')}
            </Btn>
          ) : (
            <Btn kind={taskDone ? 'gold' : 'dark'} icon={Icon.next} onClick={() => setStepIdx((i) => i + 1)} disabled={!taskDone} testId="step-next">
              {t('common.next')}
            </Btn>
          )}
          {lesson.course !== 'rules' && (
            <Btn kind="ghost" onClick={() => app.go({ name: 'game', mode: 'ai', startFen: fen, playerColor: turn, level: profile.aiLevel })}>
              {t('lesson.practice')}
            </Btn>
          )}
        </div>
      </aside>
    </div>
  );
}
