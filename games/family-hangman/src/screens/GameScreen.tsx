import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../state';
import { Btn, Confirm, Modal, TopBar } from '../components/ui';
import { Stars } from '../components/icons';
import { Scene } from '../components/Scene';
import { SpeakButton } from '../components/SpeakButton';
import { LetterKeyboard, letterFromKey } from '../components/LetterKeyboard';
import { sound } from '../audio/sound';
import {
  canLetterHint,
  guess,
  letterHint,
  levelOf,
  livesLeft,
  masked,
  newRound,
  pickWord,
  showMeaning,
  starsFor,
  status,
  wordPool,
  wrongLetters,
  type Level,
  type Round,
} from '../game/hangman';
import { categoryOf, WORD_BY_KEY, type CategoryId } from '../game/words';
import { missedWords, recordSolo } from '../storage/schema';

type Props =
  | { mode: 'solo'; level: Level | 'all'; category: CategoryId | 'all'; only?: string[] }
  | { mode: 'two'; word: string; hint: string };

export function GameScreen(props: Props) {
  const app = useApp();
  const { t, lang, profile, updateProfile, feel, toast, backGuard } = app;
  const profileRef = useRef(profile);
  profileRef.current = profile;

  /** Next solo word; null when the practice list is used up. */
  const nextSoloWord = useCallback((): string | null => {
    if (props.mode !== 'solo') return null;
    const p = profileRef.current;
    const only = props.only ? props.only.filter((w) => missedWords(p).includes(w)) : undefined;
    if (props.only && !only?.length) return null;
    const w = pickWord(wordPool({ level: props.level, category: props.category, only }), p.recent);
    return w?.w ?? null;
  }, [props]);

  const [round, setRound] = useState<Round>(() => newRound(props.mode === 'two' ? props.word : (nextSoloWord() ?? 'cat')));
  const [asking, setAsking] = useState(false);
  const recorded = useRef(false);
  const st = status(round);
  const lives = livesLeft(round);
  const info = props.mode === 'solo' ? WORD_BY_KEY[round.word] : undefined;
  const cat = info ? categoryOf(info.cat) : undefined;

  const marks = useMemo(() => {
    const m: Record<string, 'hit' | 'miss'> = {};
    for (const l of round.guessed) m[l] = round.word.includes(l) ? 'hit' : 'miss';
    return m;
  }, [round]);

  const roundRef = useRef(round);
  roundRef.current = round;
  const press = useCallback(
    (letter: string) => {
      const { round: nr, result } = guess(roundRef.current, letter);
      if (result === 'hit') sound.play('correct', 0, 0.96 + Math.random() * 0.08);
      else if (result === 'miss') {
        sound.play('wrong');
        feel('light');
      } else if (result === 'repeat') {
        sound.play('illegal');
        toast(t('game.repeat'));
      }
      roundRef.current = nr;
      setRound(nr);
    },
    [feel, toast, t],
  );

  // the round just ended: sound, vibration and the record (once)
  useEffect(() => {
    if (st === 'playing' || recorded.current) return;
    recorded.current = true;
    if (st === 'won') {
      sound.play('solved', 160);
      feel('medium');
    } else sound.play('draw', 160);
    if (props.mode === 'solo') updateProfile((p) => recordSolo(p, round.word, st === 'won', starsFor(round)));
    else updateProfile((p) => ({ ...p, stats: { ...p.stats, twoPlayed: p.stats.twoPlayed + 1 } }));
  }, [st, round, props.mode, updateProfile, feel]);

  const next = useCallback(() => {
    const w = nextSoloWord();
    if (!w) {
      toast(t('game.practiceDone'));
      app.back();
      return;
    }
    recorded.current = false;
    setRound(newRound(w));
  }, [nextSoloWord, toast, t, app]);

  // physical keyboard (PC web)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (asking) return;
      if (st !== 'playing') {
        if (e.code === 'Enter' && props.mode === 'solo') next();
        return;
      }
      const l = letterFromKey(e);
      if (l) {
        e.preventDefault();
        press(l);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [st, press, next, asking, props.mode]);

  const started = round.guessed.length > 0 && st === 'playing';
  const leave = () => (started ? setAsking(true) : app.back());
  useEffect(() => {
    backGuard.current = () => {
      if (!started) return false;
      setAsking(true);
      return true;
    };
    return () => {
      backGuard.current = null;
    };
  }, [started, backGuard]);

  const stars = starsFor(round);
  const title =
    props.mode === 'two'
      ? t('two.title')
      : props.only
        ? t('game.practice')
        : `${cat ? cat[lang] : ''} · ${t(`setup.levels.${levelOf(round.word)}`)}`;

  return (
    <div className="screen game">
      <TopBar title={title} onBack={leave} right={<span className="streak">{props.mode === 'solo' && profile.stats.streak > 1 ? t('game.streak', { n: profile.stats.streak }) : ''}</span>} />
      <div className="gameBody">
        <div className="sceneBox">
          <Scene picture={profile.picture} lives={lives} state={st} />
          <p className="livesText" data-testid="lives">{t(profile.picture === 'classic' ? 'game.livesClassic' : 'game.lives', { n: lives })}</p>
        </div>
        <div className="playBox">
          <div className="slots" data-testid="word" data-len={round.word.length}>
            {masked(round).map((l, i) => (
              <span key={i} className={`slot${l ? ' open' : ''}${!l && st === 'lost' ? ' missed' : ''}`}>
                {(l ?? (st === 'lost' ? round.word[i] : '')).toUpperCase()}
              </span>
            ))}
          </div>
          <div className="clueLine" data-testid="clue">
            {props.mode === 'two'
              ? props.hint && t('game.hint', { h: props.hint })
              : (round.meaningShown || st !== 'playing') && info && t('game.meaning', { m: info.ko })}
          </div>
          {props.mode === 'solo' && st === 'playing' && (
            <div className="hintBtns">
              <Btn size="sm" kind="ghost" disabled={round.meaningShown} testId="hint-meaning" onClick={() => setRound(showMeaning)}>
                {t('game.meaningBtn')}
              </Btn>
              <Btn size="sm" kind="ghost" disabled={!canLetterHint(round)} testId="hint-letter" onClick={() => { setRound((r) => letterHint(r)); sound.play('wrong'); }}>
                {t('game.letterBtn')} <small>({t(profile.picture === 'classic' ? 'game.letterCostClassic' : 'game.letterCost')})</small>
              </Btn>
            </div>
          )}
          <div className="tried" data-testid="tried">
            {t('game.tried')}: <b>{wrongLetters(round).map((l) => l.toUpperCase()).join(' ') || '—'}</b>
          </div>
          <LetterKeyboard marks={marks} onKey={press} disabled={st !== 'playing'} />
        </div>
      </div>

      {st !== 'playing' && (
        <Modal
          title={
            props.mode === 'two' ? (st === 'won' ? t('two.winGuesser') : t('two.winSetter')) : st === 'won' ? t('game.won') : t('game.lost')
          }
          actions={
            props.mode === 'solo' ? (
              <>
                <Btn kind="ghost" onClick={() => app.back()} testId="result-home">
                  {t('game.home')}
                </Btn>
                <Btn kind="gold" size="lg" onClick={next} testId="result-next">
                  {t('game.next')}
                </Btn>
              </>
            ) : (
              <>
                <Btn kind="ghost" onClick={() => app.home()} testId="result-home">
                  {t('game.home')}
                </Btn>
                <Btn kind="gold" size="lg" onClick={() => app.replace({ name: 'two' })} testId="result-new">
                  {t('two.newWord')}
                </Btn>
              </>
            )
          }
        >
          <div className="result" data-testid="result" data-result={st}>
            <div className="resultWordRow">
              <p className="resultWord">{round.word.toUpperCase()}</p>
              <SpeakButton word={round.word} />
            </div>
            {info && <p className="resultMeaning">{info.ko}</p>}
            {st === 'won' && props.mode === 'solo' && <Stars n={stars} size="44px" />}
          </div>
        </Modal>
      )}
      {asking && (
        <Confirm
          text={t('game.quitAsk')}
          yes={t('game.quit')}
          onNo={() => setAsking(false)}
          onYes={() => {
            setAsking(false);
            app.back();
          }}
        />
      )}
    </div>
  );
}
