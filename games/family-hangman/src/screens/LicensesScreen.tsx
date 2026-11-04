import { useApp } from '../state';
import { TopBar } from '../components/ui';

const ITEMS: [name: string, license: string, note: string][] = [
  ['React / React DOM', 'MIT', 'Meta Platforms, Inc.'],
  ['Capacitor (core, android, app, filesystem, haptics, preferences, share)', 'MIT', 'Drifty Co. (Ionic)'],
  ['Nunito', 'SIL Open Font License 1.1', 'The Nunito Project Authors'],
  ['Gowun Dodum · Gowun Batang', 'SIL Open Font License 1.1', 'The Gowun Dodum / Gowun Batang Project Authors'],
  ['HANGMAN MASTER word list, pictures, sounds', 'Original', 'PLAYVAULT family project'],
];

export function LicensesScreen() {
  const { t } = useApp();
  return (
    <div className="screen licenses">
      <TopBar title={t('licenses.title')} />
      <p className="hintText">{t('licenses.intro')}</p>
      <div className="wordList">
        {ITEMS.map(([n, l, a]) => (
          <div className="wordRow" key={n}>
            <b>{n}</b>
            <span>{l}</span>
            <small>{a}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
