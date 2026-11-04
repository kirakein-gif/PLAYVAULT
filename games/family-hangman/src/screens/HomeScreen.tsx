import { useState } from 'react';
import { useApp } from '../state';
import { Btn, LangToggle, Modal, SettingsButton } from '../components/ui';
import { BalloonScene } from '../components/BalloonScene';
import { APP_TITLE } from '../brand';
import { hubUrl } from '../platform/native';
import { LEVELS, wordPool, type Level } from '../game/hangman';
import { CATEGORIES, type CategoryId } from '../game/words';
import { missedWords } from '../storage/schema';

function MiniBasket() {
  return (
    <svg viewBox="0 0 100 100" className="cardArt" aria-hidden>
      <ellipse cx="34" cy="30" rx="13" ry="16" fill="#c98b7d" />
      <ellipse cx="56" cy="22" rx="13" ry="16" fill="#8fae8b" />
      <ellipse cx="72" cy="36" rx="13" ry="16" fill="#d1b36a" />
      <path d="M34 46 L44 72 M56 38 L50 72 M72 52 L58 72" stroke="#c9bfa8" strokeWidth="1.4" />
      <path d="M38 72 H64 L60 90 H42Z" fill="#8a6440" />
    </svg>
  );
}

function TwoArt() {
  return (
    <svg viewBox="0 0 100 100" className="cardArt" aria-hidden>
      <rect x="12" y="36" width="30" height="34" rx="6" fill="none" stroke="#e3c58f" strokeWidth="3" />
      <text x="27" y="61" textAnchor="middle" fontSize="22" fontWeight="700" fill="#e3c58f" fontFamily="Nunito Variable, sans-serif">A</text>
      <rect x="58" y="36" width="30" height="34" rx="6" fill="none" stroke="#8fae8b" strokeWidth="3" />
      <text x="73" y="61" textAnchor="middle" fontSize="22" fontWeight="700" fill="#8fae8b" fontFamily="Nunito Variable, sans-serif">?</text>
      <path d="M44 53 H56" stroke="#aeb9c0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function BookArt() {
  return (
    <svg viewBox="0 0 100 100" className="cardArt" aria-hidden>
      <path d="M50 28 Q34 20 16 24 V76 Q34 72 50 80 Q66 72 84 76 V24 Q66 20 50 28Z" fill="#2a3a46" stroke="#e3c58f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M50 28 V80" stroke="#e3c58f" strokeWidth="2" />
      <path d="M24 38 H42 M24 48 H42 M58 38 H76 M58 48 H70" stroke="#aeb9c0" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function SoloSetup({ onClose }: { onClose: () => void }) {
  const { t, lang, profile, updateProfile, go, click } = useApp();
  const [level, setLevel] = useState<Level | 'all'>(profile.level);
  const [category, setCategory] = useState<CategoryId | 'all'>(profile.category);
  const count = wordPool({ level, category }).length;
  return (
    <Modal
      title={t('setup.title')}
      wide
      onClose={onClose}
      actions={
        <>
          <Btn kind="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Btn>
          <Btn
            kind="gold"
            size="lg"
            disabled={!count}
            testId="setup-start"
            onClick={() => {
              updateProfile((p) => ({ ...p, level, category }));
              onClose();
              go({ name: 'game', mode: 'solo', level, category });
            }}
          >
            {t('setup.start')}
          </Btn>
        </>
      }
    >
      <h3 className="setupH">{t('setup.level')}</h3>
      <div className="choiceRow">
        {[...LEVELS, 'all' as const].map((l) => (
          <button key={l} className={`choice${level === l ? ' on' : ''}`} data-testid={`level-${l}`} onClick={() => { click(); setLevel(l); }}>
            <b>{t(`setup.levels.${l}`)}</b>
            <small>{t(`setup.levelSub.${l}`)}</small>
          </button>
        ))}
      </div>
      <h3 className="setupH">{t('setup.category')}</h3>
      <div className="catGrid">
        <button className={`chip${category === 'all' ? ' on' : ''}`} data-testid="cat-all" onClick={() => { click(); setCategory('all'); }}>
          {t('setup.all')}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`chip${category === c.id ? ' on' : ''}`} data-testid={`cat-${c.id}`} onClick={() => { click(); setCategory(c.id); }}>
            {c[lang]}
          </button>
        ))}
      </div>
      <p className="hintText" data-testid="pool-count">
        {count ? t('setup.count', { n: count }) : t('setup.none')}
      </p>
    </Modal>
  );
}

export function HomeScreen() {
  const { t, profile, go, click, data } = useApp();
  const [setup, setSetup] = useState(false);
  const missed = missedWords(profile).length;
  const card = (id: string, art: React.ReactNode, label: string, sub: string, onClick: () => void) => (
    <button className="menuCard" data-testid={id} onClick={() => { click(); onClick(); }}>
      <span className="menuArt">{art}</span>
      <span className="menuLabel">{label}</span>
      <span className="menuSub">{sub}</span>
    </button>
  );
  return (
    <div className="screen home">
      <div className="homeBg" aria-hidden>
        <BalloonScene lives={6} state="playing" />
      </div>
      <header className="homeTop">
        <div className="brand">
          {hubUrl && (
            <a className="hubLink" href={hubUrl} data-testid="hub-link">
              {t('home.hub')}
            </a>
          )}
          <span className="brandName" data-testid="brand">{APP_TITLE}</span>
        </div>
        <div className="homeTopRight">
          <span className="who" data-testid="who">
            {profile.name}
            {data.profileOrder.length > 1 && <small> · {t('home.record', { won: profile.stats.won, best: profile.stats.bestStreak })}</small>}
          </span>
          <LangToggle compact />
          <SettingsButton />
        </div>
      </header>
      <main className="menu">
        {card('menu-solo', <MiniBasket />, t('home.solo'), t('home.soloSub'), () => setSetup(true))}
        {card('menu-two', <TwoArt />, t('home.two'), t('home.twoSub'), () => go({ name: 'two' }))}
        {card('menu-words', <BookArt />, t('home.words'), missed ? `${t('home.wordsSub')} (${missed})` : t('home.wordsSub'), () => go({ name: 'words' }))}
      </main>
      {setup && <SoloSetup onClose={() => setSetup(false)} />}
    </div>
  );
}
