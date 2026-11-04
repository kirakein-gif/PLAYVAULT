import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { Btn, TopBar } from '../components/ui';
import { LetterKeyboard, letterFromKey } from '../components/LetterKeyboard';
import { MAX_CUSTOM, MIN_CUSTOM, normalizeCustomWord } from '../game/hangman';
import { sound } from '../audio/sound';

/** Step 1: the setter types a word (hidden by default). Step 2: hand the tablet over. */
export function TwoSetupScreen() {
  const { t, replace } = useApp();
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [show, setShow] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const valid = normalizeCustomWord(word);

  const add = (l: string) => {
    sound.play('select');
    setWord((w) => (w.length < MAX_CUSTOM ? w + l : w));
  };
  const erase = () => setWord((w) => w.slice(0, -1));

  useEffect(() => {
    if (handoff) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return; // typing the hint
      const l = letterFromKey(e);
      if (l) add(l);
      else if (e.code === 'Backspace') erase();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handoff]);

  if (handoff && valid)
    return (
      <div className="screen handoff" data-testid="handoff">
        <TopBar title={t('two.title')} onBack={() => setHandoff(false)} />
        <div className="handoffBox">
          <p className="handoffText">{t('two.handoff')}</p>
          <p className="hintText">{t('two.handoffSub', { n: valid.length })}</p>
          <Btn kind="gold" size="lg" testId="two-go" onClick={() => replace({ name: 'game', mode: 'two', word: valid, hint: hint.trim().slice(0, 40) })}>
            {t('two.go')}
          </Btn>
        </div>
      </div>
    );

  return (
    <div className="screen two">
      <TopBar title={t('two.title')} />
      <div className="twoBody">
        <p className="twoStep">
          {t('two.step1')} <small>{t('two.step1Sub')}</small>
        </p>
        <div className="entryRow">
          <div className="slots entry" data-testid="entry" data-len={word.length}>
            {word.length === 0 && <span className="slot ghost" />}
            {[...word].map((l, i) => (
              <span key={i} className="slot open">
                {show ? l.toUpperCase() : '•'}
              </span>
            ))}
          </div>
          <Btn size="sm" kind="ghost" testId="two-show" onClick={() => setShow((v) => !v)}>
            {show ? t('two.hide') : t('two.show')}
          </Btn>
        </div>
        <label className="hintField">
          <span>{t('two.hintLabel')}</span>
          <input className="textInput" value={hint} maxLength={40} placeholder={t('two.hintPh')} onChange={(e) => setHint(e.target.value)} data-testid="two-hint" />
        </label>
        {word.length > 0 && !valid && <p className="warnText">{t('two.invalid', { min: MIN_CUSTOM, max: MAX_CUSTOM })}</p>}
        <LetterKeyboard
          onKey={add}
          extra={
            <button className="key wide" data-testid="key-erase" onClick={erase}>
              ⌫
            </button>
          }
        />
        <div className="twoActions">
          <Btn kind="gold" size="lg" disabled={!valid} testId="two-next" onClick={() => setHandoff(true)}>
            {t('two.next')}
          </Btn>
        </div>
      </div>
    </div>
  );
}
