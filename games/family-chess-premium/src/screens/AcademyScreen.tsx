import { useApp } from '../state';
import { TopBar, LangToggle, SettingsButton } from '../components/ui';
import { Icon } from '../components/icons';
import { PUZZLES, puzzlesOfCourse, type Course } from '../academy/puzzles';
import { lessonsOf } from '../academy/lessons';
import { localDate, pickDaily } from '../academy/daily';
import type { Screen } from '../state';

export function AcademyScreen() {
  const { t, profile, go, click, updateProfile, piece } = useApp();
  const solvedIn = (c: Course) => {
    const list = puzzlesOfCourse(c);
    return { solved: list.filter((p) => profile.puzzles[p.id]?.solved).length, total: list.length };
  };
  const lessonsDone = (c: 'strategy' | 'openings' | 'endgames') => {
    const l = lessonsOf(c);
    return { done: l.filter((x) => profile.lessons[x.id]?.completed).length, total: l.length };
  };
  const today = localDate();
  const daily = profile.daily?.date === today ? profile.daily : null;
  const dailyDone = daily ? daily.done.length : 0;
  const dailyTotal = daily ? daily.ids.length : 5;

  const openDaily = () => {
    click();
    let d = daily;
    if (!d) {
      const ids = pickDaily(PUZZLES, profile.puzzles, profile.id, today);
      d = { date: today, ids, done: [], celebrated: false };
      const nd = d;
      updateProfile((p) => ({ ...p, daily: nd }));
    }
    const next = d.ids.find((id) => !d!.done.includes(id)) ?? d.ids[0];
    if (next) go({ name: 'puzzle', id: next, list: d.ids, daily: true });
  };

  const tile = (key: string, art: string, sub: string, target: Screen, progress: string, testId: string) => (
    <button className="courseTile" data-testid={testId} onClick={() => { click(); go(target); }}>
      <img className="courseArt" src={piece(art)} alt="" />
      <span className="courseName">{t(`academy.course.${key}`)}</span>
      <span className="courseDesc">{sub}</span>
      <span className="courseProgress">{progress}</span>
    </button>
  );

  const tac = solvedIn('tactics');
  const mate = solvedIn('checkmate');
  const st = lessonsDone('strategy');
  const op = lessonsDone('openings');
  const eg = lessonsDone('endgames');
  const egp = solvedIn('endgames');
  return (
    <div className="screen academy">
      <TopBar title={t('academy.title')} right={<><LangToggle /><SettingsButton /></>} />
      <div className="academyBody">
        <button className={`dailyCard${daily && dailyDone >= dailyTotal ? ' done' : ''}`} data-testid="daily" onClick={openDaily}>
          <div>
            <div className="dailyTitle">{t('academy.daily')}</div>
            <div className="dailyDesc">{t('academy.dailyDesc')}</div>
          </div>
          <div className="dailyProgress">
            {daily && dailyDone >= dailyTotal ? (
              <span className="dailyCheck">{Icon.check} {t('academy.dailyDone')}</span>
            ) : (
              <span>{dailyDone} / {dailyTotal}</span>
            )}
          </div>
        </button>
        <div className="courseGrid">
          {tile('tactics', 'wN', t('academy.course.tacticsDesc'), { name: 'puzzles', course: 'tactics' }, t('academy.solvedOf', tac), 'course-tactics')}
          {tile('checkmate', 'bK', t('academy.course.checkmateDesc'), { name: 'puzzles', course: 'checkmate' }, t('academy.solvedOf', mate), 'course-checkmate')}
          {tile('strategy', 'wB', t('academy.course.strategyDesc'), { name: 'lessons', course: 'strategy' }, t('academy.lessonsDone', st), 'course-strategy')}
          {tile('openings', 'wP', t('academy.course.openingsDesc'), { name: 'lessons', course: 'openings' }, t('academy.lessonsDone', op), 'course-openings')}
          {tile('endgames', 'bR', t('academy.course.endgamesDesc'), { name: 'lessons', course: 'endgames' }, `${t('academy.lessonsDone', eg)} · ${t('academy.solvedOf', egp)}`, 'course-endgames')}
          {tile('review', 'wQ', t('academy.course.reviewDesc'), { name: 'games' }, t('records.games', { n: profile.games.length }), 'course-review')}
        </div>
        <div className="academyLinks">
          <button className="linkBtn" data-testid="records" onClick={() => { click(); go({ name: 'records' }); }}>
            {Icon.chart} {t('academy.records')}
          </button>
          <button className="linkBtn" data-testid="glossary" onClick={() => { click(); go({ name: 'glossary' }); }}>
            {Icon.book} {t('academy.glossary')}
          </button>
          <button className="linkBtn" onClick={() => { click(); go({ name: 'lessons', course: 'rules' }); }}>
            {Icon.info} {t('academy.rules')}
          </button>
        </div>
      </div>
    </div>
  );
}
