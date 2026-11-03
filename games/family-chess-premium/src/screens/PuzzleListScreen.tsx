import { useState } from 'react';
import { useApp } from '../state';
import { TopBar } from '../components/ui';
import { Icon, Stars } from '../components/icons';
import { COURSE_CATEGORIES, PUZZLES, puzzlesOfCourse, type Course } from '../academy/puzzles';
import { matchesFilter, statusOf, type PuzzleFilter } from '../academy/progressManager';
import type { Difficulty, PuzzleCategory } from '../academy/types';

const FILTERS: PuzzleFilter[] = ['all', 'untried', 'unsolved', 'solved', 'below3', 'favorites'];

export function PuzzleListScreen({ course }: { course: Course }) {
  const { t, profile, go, click } = useApp();
  const [filter, setFilter] = useState<PuzzleFilter>('all');
  const [cat, setCat] = useState<PuzzleCategory | 'all'>('all');
  const [diff, setDiff] = useState<Difficulty | 'all'>('all');
  const cats = COURSE_CATEGORIES[course];
  const list = puzzlesOfCourse(course).filter(
    (p) => (cat === 'all' || p.category === cat) && (diff === 'all' || p.difficulty === diff) && matchesFilter(filter, profile.puzzles[p.id], profile.favorites.includes(p.id)),
  );
  const title = course === 'tactics' ? t('academy.course.tactics') : course === 'checkmate' ? t('academy.course.checkmate') : course === 'endgames' ? t('academy.course.endgames') : t('puzzles.title');
  const chip = (on: boolean, label: string, onClick: () => void, testId?: string) => (
    <button className={`chip${on ? ' on' : ''}`} data-testid={testId} onClick={() => { click(); onClick(); }}>
      {label}
    </button>
  );
  return (
    <div className="screen puzzleList">
      <TopBar title={title} />
      <div className="filters">
        <div className="chipRow">{FILTERS.map((f) => chip(filter === f, t(`puzzles.filter.${f}`), () => setFilter(f), `filter-${f}`))}</div>
        <div className="chipRow">
          {cats.length > 1 && (
            <>
              {chip(cat === 'all', t('puzzles.allThemes'), () => setCat('all'))}
              {cats.map((c) => chip(cat === c, t(`puzzles.cat.${c}`), () => setCat(c), `cat-${c}`))}
              <span className="chipSep" />
            </>
          )}
          {chip(diff === 'all', t('puzzles.allLevels'), () => setDiff('all'))}
          {(['easy', 'medium', 'hard'] as const).map((d) => chip(diff === d, t(`puzzles.difficulty.${d}`), () => setDiff(d), `diff-${d}`))}
        </div>
      </div>
      {list.length === 0 ? (
        <p className="empty">{t('puzzles.empty')}</p>
      ) : (
        <div className="stageGrid" data-testid="stage-grid">
          {list.map((p) => {
            const r = profile.puzzles[p.id];
            const st = statusOf(r);
            const n = PUZZLES.indexOf(p) + 1;
            return (
              <button
                key={p.id}
                className={`stage s-${st} d-${p.difficulty}`}
                data-testid={`stage-${p.id}`}
                onClick={() => {
                  click();
                  go({ name: 'puzzle', id: p.id, list: list.map((x) => x.id) });
                }}
              >
                <span className="stageNo">{n}</span>
                <span className="stageCat">{t(`puzzles.cat.${p.category}`)}{p.mateIn ? ` ${p.mateIn}` : ''}</span>
                <Stars n={r?.best ?? 0} size="1.05em" />
                <span className="stageStatus">{t(`puzzles.status.${st}`)}</span>
                {profile.favorites.includes(p.id) && <span className="fav">{Icon.heart}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
