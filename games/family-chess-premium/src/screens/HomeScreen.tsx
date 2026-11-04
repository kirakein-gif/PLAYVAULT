import { useState } from 'react';
import { useApp } from '../state';
import { Btn, Confirm, LangToggle, Modal, SettingsButton } from '../components/ui';
import { Icon } from '../components/icons';
import { SetupModal } from './SetupModal';
import { SKINS } from '../skins';
import { hubUrl } from '../platform/native';

export function HomeScreen() {
  const { t, go, profile, data, setData, click, updateProfile, piece, skin } = useApp();
  const art = SKINS.find((s) => s.id === skin)?.menuArt ?? {};
  const [setup, setSetup] = useState(false);
  const [resumeFor, setResumeFor] = useState<'two' | 'ai' | null>(null);
  const [profiles, setProfiles] = useState(false);

  const start = (mode: 'two' | 'ai') => {
    click();
    if (profile.inProgress && profile.inProgress.mode === mode && profile.inProgress.moves.length > 0) {
      setResumeFor(mode);
      return;
    }
    if (mode === 'two') go({ name: 'game', mode: 'two' });
    else setSetup(true);
  };

  return (
    <div className="screen home">
      <div className="homeBg" aria-hidden>
        <img src={piece("wK")} className="bgKing" alt="" />
        <img src={piece("bN")} className="bgKnight" alt="" />
      </div>
      <header className="homeTop">
        <div className="brand">
          <span className="brandName">{t('app.name')}</span>
          <span className="brandPremium">PREMIUM</span>
        </div>
        <div className="homeTopRight">
          {hubUrl && <a className="hubLink" href={hubUrl} data-testid="hub-link">← PLAYVAULT</a>}
          <LangToggle />
          <SettingsButton />
        </div>
      </header>
      <main className="menu">
        <button className="menuCard" data-testid="menu-two" onClick={() => start('two')}>
          <span className={`menuArt two${art.two ? ' illus' : ''}`}>
            {art.two ? <img src={art.two} alt="" /> : <><img src={piece("wN")} alt="" /><img src={piece("bN")} alt="" /></>}
          </span>
          <span className="menuLabel">{t('home.twoPlayers')}</span>
          <span className="menuSub">{t('home.twoPlayersSub')}</span>
        </button>
        <button className="menuCard" data-testid="menu-ai" onClick={() => start('ai')}>
          <span className={`menuArt ai${art.ai ? ' illus' : ''}`}>
            <img src={art.ai ?? piece("bK")} alt="" />
          </span>
          <span className="menuLabel">{t('home.vsComputer')}</span>
          <span className="menuSub">{t('home.vsComputerSub')}</span>
        </button>
        <button
          className="menuCard"
          data-testid="menu-academy"
          onClick={() => {
            click();
            go({ name: 'academy' });
          }}
        >
          <span className={`menuArt academy${art.academy ? ' illus' : ''}`}>
            {art.academy ? <img src={art.academy} alt="" /> : <><img src={piece("wQ")} alt="" /><img src={piece("wB")} alt="" /></>}
          </span>
          <span className="menuLabel">{t('home.academy')}</span>
          <span className="menuSub">{t('home.academySub')}</span>
        </button>
      </main>
      <footer className="homeFoot">
        <button className="profileChip" data-testid="profile-chip" onClick={() => { click(); setProfiles(true); }}>
          {Icon.user}
          <span>{profile.name}</span>
        </button>
      </footer>

      {setup && <SetupModal onClose={() => setSetup(false)} />}
      {resumeFor && profile.inProgress && (
        <Confirm
          text={
            <>
              <b>{t('home.resumeTitle')}</b>
              <br />
              {t('home.resumeBody', { mode: t(resumeFor === 'two' ? 'home.twoPlayers' : 'home.vsComputer'), moves: Math.ceil(profile.inProgress.moves.length / 2) })}
            </>
          }
          yes={t('home.resume')}
          no={t('home.discard')}
          onYes={() => {
            const m = resumeFor;
            setResumeFor(null);
            go({ name: 'game', mode: m, resume: true });
          }}
          onNo={() => {
            const m = resumeFor;
            setResumeFor(null);
            updateProfile((p) => ({ ...p, inProgress: null }));
            if (m === 'two') go({ name: 'game', mode: 'two' });
            else setSetup(true);
          }}
        />
      )}
      {profiles && (
        <Modal title={t('settings.profiles')} onClose={() => setProfiles(false)} actions={<Btn onClick={() => setProfiles(false)}>{t('common.close')}</Btn>}>
          <div className="profileList">
            {data.profileOrder.map((id) => (
              <button
                key={id}
                className={`profileRow${id === data.activeProfileId ? ' active' : ''}`}
                data-testid={`profile-${id}`}
                onClick={() => {
                  click();
                  setData({ ...data, activeProfileId: id });
                  setProfiles(false);
                }}
              >
                {Icon.user}
                <span>{data.profiles[id].name}</span>
                {id === data.activeProfileId && <em>{t('settings.current')}</em>}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
