import { useApp } from '../state';
import { TopBar } from '../components/ui';
import { Icon } from '../components/icons';

export function GamesScreen() {
  const { t, profile, go, click } = useApp();
  return (
    <div className="screen games">
      <TopBar title={t('academy.course.review')} />
      {profile.games.length === 0 ? (
        <p className="empty">{t('review.noGames')}</p>
      ) : (
        <div className="gameRows">
          <p className="hintText">{t('review.pickGame')}</p>
          {profile.games.map((g) => {
            const d = new Date(g.date);
            return (
              <button key={g.id} className="gameRow" data-testid={`saved-${g.id}`} onClick={() => { click(); go({ name: 'review', gameId: g.id }); }}>
                <span className="gameDate">{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="gameMode">{g.mode === 'ai' ? `${t('home.vsComputer')} · L${g.level}` : t('home.twoPlayers')}</span>
                <span className="gameResult">{g.result}</span>
                <span className="gamePlies">{t('review.moveN', { n: Math.ceil(g.plies / 2) })}</span>
                {Icon.next}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
