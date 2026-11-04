import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './state';
import type { AppData } from './storage/schema';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { AcademyScreen } from './screens/AcademyScreen';
import { PuzzleListScreen } from './screens/PuzzleListScreen';
import { PuzzleScreen } from './screens/PuzzleScreen';
import { LessonsScreen } from './screens/LessonsScreen';
import { LessonScreen } from './screens/LessonScreen';
import { RecordsScreen } from './screens/RecordsScreen';
import { GlossaryScreen } from './screens/GlossaryScreen';
import { GamesScreen } from './screens/GamesScreen';
import { LicensesScreen } from './screens/LicensesScreen';
import { SettingsModal } from './screens/SettingsModal';
import { Btn, Confirm } from './components/ui';
import { exitApp, isNative, onBackButton, onLifecycle } from './platform/native';
import { flushSave } from './storage/store';
import { getEngine } from './engine/stockfishAdapter';
import { sound } from './audio/sound';

function Router() {
  const app = useApp();
  const s = app.screen;
  const k = app.screenKey;
  switch (s.name) {
    case 'home':
      return <HomeScreen key={k} />;
    case 'setup':
      return <HomeScreen key={k} />;
    case 'game':
      return <GameScreen key={k} {...s} />;
    case 'review':
      return <ReviewScreen key={k} gameId={s.gameId} ply={s.ply} />;
    case 'games':
      return <GamesScreen key={k} />;
    case 'academy':
      return <AcademyScreen key={k} />;
    case 'puzzles':
      return <PuzzleListScreen key={k} course={s.course} />;
    case 'puzzle':
      return <PuzzleScreen key={k} id={s.id} list={s.list} daily={s.daily} />;
    case 'lessons':
      return <LessonsScreen key={k} course={s.course} />;
    case 'lesson':
      return <LessonScreen key={k} id={s.id} />;
    case 'records':
      return <RecordsScreen key={k} />;
    case 'glossary':
      return <GlossaryScreen key={k} />;
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

  // keep data safe when the app goes to the background
  useEffect(
    () =>
      onLifecycle(
        () => {
          void flushSave();
          sound.suspend();
        },
        () => undefined,
      ),
    [],
  );

  // unlock audio on the very first touch anywhere
  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // warm the engine up in the background so the first computer game is instant
  useEffect(() => {
    const id = setTimeout(() => void getEngine().init().catch(() => undefined), 1500);
    return () => clearTimeout(id);
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

export { Btn };
