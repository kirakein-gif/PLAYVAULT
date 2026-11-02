import { useState } from 'react';
import { useApp } from '../state';
import { Btn, Modal } from '../components/ui';
import { LEVELS } from '../engine/difficulty';

export function SetupModal({ onClose, replace }: { onClose: () => void; replace?: boolean }) {
  const { t, profile, updateProfile, go, click, replace: replaceScreen } = useApp();
  const [level, setLevel] = useState(profile.aiLevel);
  const [color, setColor] = useState<'w' | 'b' | 'random'>(profile.aiColor);
  const start = () => {
    const pc: 'w' | 'b' = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
    updateProfile((p) => ({ ...p, aiLevel: level, aiColor: color, inProgress: null }));
    onClose();
    const s = { name: 'game' as const, mode: 'ai' as const, level, playerColor: pc };
    if (replace) replaceScreen(s);
    else go(s);
  };
  return (
    <Modal title={t('setup.title')} onClose={onClose} wide actions={<><Btn kind="ghost" onClick={onClose}>{t('common.cancel')}</Btn><Btn kind="gold" size="lg" onClick={start} testId="setup-start">{t('setup.start')}</Btn></>}>
      <div className="setupSection">
        <div className="setupLabel">{t('setup.level')}</div>
        <div className="levelRow">
          {LEVELS.map((l) => (
            <button
              key={l.level}
              className={`levelCard${level === l.level ? ' on' : ''}`}
              data-testid={`level-${l.level}`}
              onClick={() => {
                click();
                setLevel(l.level);
              }}
            >
              <span className="levelNum">{l.level}</span>
              <span className="levelName">{t(`setup.levels.${l.key}`)}</span>
              <span className="levelDesc">{t(`setup.levels.${l.key}Desc`)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="setupSection">
        <div className="setupLabel">{t('setup.color')}</div>
        <div className="colorRow">
          {(['w', 'b', 'random'] as const).map((c) => (
            <button
              key={c}
              className={`colorCard${color === c ? ' on' : ''}`}
              data-testid={`color-${c}`}
              onClick={() => {
                click();
                setColor(c);
              }}
            >
              {c === 'random' ? (
                <span className="colorPair">
                  <img src="pieces/wK.svg" alt="" />
                  <img src="pieces/bK.svg" alt="" />
                </span>
              ) : (
                <img src={`pieces/${c}K.svg`} alt="" />
              )}
              <span>{t(c === 'w' ? 'common.white' : c === 'b' ? 'common.black' : 'common.random')}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
