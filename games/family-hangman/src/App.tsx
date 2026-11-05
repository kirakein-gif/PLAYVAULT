import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './state';
import type { AppData } from './storage/schema';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { TwoSetupScreen } from './screens/TwoSetupScreen';
import { WordsScreen } from './screens/WordsScreen';
import { LicensesScreen } from './screens/LicensesScreen';
import { SettingsModal } from './screens/SettingsModal';
import { Confirm } from './components/ui';
import { exitApp, isNative, onBackButton, onLifecycle } from './platform/native';
import { flushSave } from './storage/store';
import { sound } from './audio/sound';
import { setFullscreen } from './platform/fullscreen';

function Router() {
  const { screen: s, screenKey: k } = useApp();
  switch (s.name) {
    case 'home':
      return <HomeScreen key={k} />;
    case 'game':
      return <GameScreen key={k} {...s} />;
    case 'two':
      return <TwoSetupScreen key={k} />;
    case 'words':
      return <WordsScreen key={k} />;
    case 'licenses':
      return <LicensesScreen key={k} />;
  }
}

function Shell() {
  const app = useApp();
  const [exitAsk, setExitAsk] = useState(false);

  // Android back button: close popups first, then go back one screen, ask before exiting
  useEffect(
    () =>
      onBackButton(() => {
        if (app.settingsOpen) return app.openSettings(false);
        if (exitAsk) return setExitAsk(false);
        if (app.backGuard.current?.()) return;
        if (app.stack.length > 1) app.back();
        else setExitAsk(true);
      }),
    [app, exitAsk],
  );

  // keep data safe when the app goes to the background; restore full screen on return
  const fsSaved = app.settings.fullscreen;
  useEffect(() => {
    if (isNative && fsSaved) void setFullscreen(true);
    return onLifecycle(
      () => {
        void flushSave();
        sound.suspend();
      },
      () => {
        if (isNative && fsSaved) void setFullscreen(true);
      },
    );
  }, [fsSaved]);

  // unlock audio on the very first touch / key anywhere
  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <div className="app">
      <Router />
      {app.settingsOpen && <SettingsModal />}
      {app.toastMsg && (
        <div className="toast" data-testid="toast" role="status">
          {app.toastMsg}
        </div>
      )}
      {!isNative && (
        <div className="narrowNote" role="note">
          {app.t('web.narrow')}
        </div>
      )}
      {exitAsk && <Confirm text={app.t('home.exitTitle')} yes={app.t('home.exit')} onYes={() => exitApp()} onNo={() => setExitAsk(false)} />}
    </div>
  );
}

export function App({ initial }: { initial: AppData }) {
  return (
    <AppProvider initial={initial}>
      <Shell />
    </AppProvider>
  );
}
