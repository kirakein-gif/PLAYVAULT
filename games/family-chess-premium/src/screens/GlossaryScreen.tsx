import { useApp } from '../state';
import { TopBar } from '../components/ui';
import { GLOSSARY } from '../academy/glossary';

export function GlossaryScreen() {
  const { t, lang } = useApp();
  return (
    <div className="screen glossary">
      <TopBar title={t('glossary.title')} />
      <div className="glossaryList">
        {GLOSSARY.map((g) => (
          <div key={g.en} className="term">
            <div className="termNames">
              <span className="ko">{g.ko}</span>
              <span className="en">{g.en}</span>
            </div>
            <div className="termDesc">{g.desc[lang]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
