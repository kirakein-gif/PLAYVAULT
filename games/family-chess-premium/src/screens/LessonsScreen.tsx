import { useApp } from '../state';
import { TopBar } from '../components/ui';
import { Icon } from '../components/icons';
import { lessonsOf } from '../academy/lessons';
import { bi, other } from '../i18n/i18n';
import { puzzlesOfCourse } from '../academy/puzzles';

export function LessonsScreen({ course }: { course: 'strategy' | 'openings' | 'endgames' | 'rules' }) {
  const { t, lang, profile, go, click, settings } = useApp();
  const list = lessonsOf(course);
  const title = course === 'rules' ? t('academy.rules') : t(`academy.course.${course}`);
  const egp = puzzlesOfCourse('endgames');
  return (
    <div className="screen lessons">
      <TopBar title={title} />
      <div className="lessonList">
        {list.map((l, i) => {
          const done = profile.lessons[l.id]?.completed;
          return (
            <button key={l.id} className={`lessonRow${done ? ' done' : ''}`} data-testid={`lesson-${l.id}`} onClick={() => { click(); go({ name: 'lesson', id: l.id }); }}>
              <span className="lessonNo">{i + 1}</span>
              <span className="lessonText">
                <span className="lessonTitle">{bi(lang, l.title)}</span>
                {settings.showOtherLang && <span className="otherLang">{bi(other(lang), l.title)}</span>}
                <span className="lessonSummary">{bi(lang, l.summary)}</span>
              </span>
              <span className="lessonState">{done ? <>{Icon.check} {t('lesson.completed')}</> : `${l.steps.length}`}</span>
            </button>
          );
        })}
        {course === 'endgames' && egp.length > 0 && (
          <button className="lessonRow puzzles" data-testid="endgame-puzzles" onClick={() => { click(); go({ name: 'puzzles', course: 'endgames' }); }}>
            <span className="lessonNo">♟</span>
            <span className="lessonText">
              <span className="lessonTitle">{t('puzzles.cat.endgame')} · {t('puzzles.title')}</span>
              <span className="lessonSummary">{t('academy.solvedOf', { solved: egp.filter((p) => profile.puzzles[p.id]?.solved).length, total: egp.length })}</span>
            </span>
            <span className="lessonState">{Icon.next}</span>
          </button>
        )}
      </div>
    </div>
  );
}
