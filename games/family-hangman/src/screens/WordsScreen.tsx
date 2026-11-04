import { useState } from 'react';
import { useApp } from '../state';
import { Btn, TopBar } from '../components/ui';
import { Stars } from '../components/icons';
import { SpeakButton } from '../components/SpeakButton';
import { CATEGORIES, WORDS, WORD_BY_KEY } from '../game/words';
import { missedWords } from '../storage/schema';

type Tab = 'missed' | 'won' | 'all';

export function WordsScreen() {
  const { t, lang, profile, go, click } = useApp();
  const missed = missedWords(profile);
  const [tab, setTab] = useState<Tab>(missed.length ? 'missed' : 'won');
  const s = profile.stats;
  const rate = s.played ? Math.round((s.won / s.played) * 100) : 0;

  const list =
    tab === 'missed'
      ? missed
      : Object.entries(profile.words)
          .filter(([, r]) => r.last === 'won')
          .sort((a, b) => b[1].lastAt.localeCompare(a[1].lastAt))
          .map(([w]) => w);

  return (
    <div className="screen words">
      <TopBar title={t('words.title')} />
      <div className="statRow" data-testid="stats">
        {[
          [t('words.played'), s.played],
          [t('words.won'), s.won],
          [t('words.rate'), `${rate}%`],
          [t('words.streak'), s.streak],
          [t('words.best'), s.bestStreak],
        ].map(([k, v]) => (
          <div className="stat" key={String(k)}>
            <b>{v}</b>
            <small>{k}</small>
          </div>
        ))}
      </div>
      <div className="tabs">
        {(['missed', 'won', 'all'] as Tab[]).map((k) => (
          <button key={k} className={`chip${tab === k ? ' on' : ''}`} data-testid={`tab-${k}`} onClick={() => { click(); setTab(k); }}>
            {t(`words.tab${k[0].toUpperCase()}${k.slice(1)}`)}
            {k === 'missed' && missed.length ? ` (${missed.length})` : ''}
          </button>
        ))}
        {tab === 'missed' && missed.length > 0 && (
          <Btn kind="gold" size="sm" testId="practice" onClick={() => go({ name: 'game', mode: 'solo', level: 'all', category: 'all', only: missed })}>
            {t('words.practice', { n: missed.length })}
          </Btn>
        )}
      </div>
      <div className="wordList" data-testid="word-list">
        {tab === 'all' ? (
          CATEGORIES.map((c) => {
            const ws = WORDS.filter((w) => w.cat === c.id);
            const done = ws.filter((w) => profile.words[w.w]?.won).length;
            return (
              <section key={c.id} className="catBlock">
                <h3>
                  {c[lang]} <small>{t('words.progress', { done, total: ws.length })}</small>
                </h3>
                <div className="wordChips">
                  {ws.map((w) => (
                    <span key={w.w} className={`wchip${profile.words[w.w]?.won ? ' done' : ''}`} title={w.ko}>
                      {profile.words[w.w] ? w.w.toUpperCase() : '·'.repeat(w.w.length)}
                    </span>
                  ))}
                </div>
              </section>
            );
          })
        ) : list.length ? (
          list.map((w) => (
            <div className="wordRow" key={w}>
              <b>{w.toUpperCase()}</b>
              <SpeakButton word={w} size="sm" />
              <span>{WORD_BY_KEY[w]?.ko ?? ''}</span>
              {tab === 'won' && <Stars n={profile.words[w].bestStars} size="26px" />}
            </div>
          ))
        ) : (
          <p className="hintText">{t('words.empty')}</p>
        )}
      </div>
    </div>
  );
}
