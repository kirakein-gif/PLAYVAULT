import { useApp } from '../state';
import { TopBar } from '../components/ui';
import { Stars } from '../components/icons';
import { PUZZLES } from '../academy/puzzles';
import { statusOf } from '../academy/progressManager';
import { LESSONS } from '../academy/lessons';
import type { PuzzleCategory } from '../academy/types';

const CATS: PuzzleCategory[] = ['mate', 'fork', 'pin', 'skewerDiscovered', 'defense', 'endgame', 'other'];

export function RecordsScreen() {
  const { t, profile, go, click } = useApp();
  const recs = profile.puzzles;
  const all = PUZZLES.map((p) => ({ p, r: recs[p.id], st: statusOf(recs[p.id]) }));
  const starSum = all.reduce((s, x) => s + (x.r?.best ?? 0), 0);
  const s = profile.stats;
  return (
    <div className="screen records">
      <TopBar title={`${t('records.title')} · ${profile.name}`} />
      <div className="recordsBody">
        <div className="recSummary" data-testid="rec-summary">
          <div className="recBig">
            <Stars n={3} size="1.4em" /> <b>{starSum}</b> / {PUZZLES.length * 3}
          </div>
          <div>{t('records.total', { total: PUZZLES.length })}</div>
          <div>{t('records.solved', { n: all.filter((x) => x.st === 'solved').length })}</div>
          <div>{t('records.unsolved', { n: all.filter((x) => x.st === 'unsolved').length })}</div>
          <div>{t('records.untried', { n: all.filter((x) => x.st === 'untried').length })}</div>
          <div>{t('records.lessons', { n: LESSONS.filter((l) => profile.lessons[l.id]?.completed).length })}</div>
          <div>{t('records.games', { n: s.gamesPlayed })}</div>
          <div>{t('records.aiRecord', { w: s.aiWins, l: s.aiLosses, d: s.aiDraws })}</div>
        </div>
        {CATS.map((c) => {
          const list = all.filter((x) => x.p.category === c);
          if (!list.length) return null;
          return (
            <section key={c} className="recCat">
              <h3>
                {t(`puzzles.cat.${c}`)} <small>{t('academy.solvedOf', { solved: list.filter((x) => x.st === 'solved').length, total: list.length })}</small>
              </h3>
              <div className="medalGrid">
                {list.map(({ p, r, st }) => (
                  <button
                    key={p.id}
                    className={`medal s-${st}`}
                    title={p.id}
                    onClick={() => {
                      click();
                      go({ name: 'puzzle', id: p.id, list: list.map((x) => x.p.id) });
                    }}
                  >
                    <span className="medalNo">{PUZZLES.indexOf(p) + 1}</span>
                    <Stars n={r?.best ?? 0} size="0.8em" />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
