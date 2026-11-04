import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { speak, speechStatus, type SpeechStatus } from '../platform/speech';

const SPEAKER = (
  <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" fillOpacity="0.25" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
);

/** 🔊 button that reads an English word aloud at the player's chosen speed. */
export function SpeakButton({ word, size = 'md' }: { word: string; size?: 'md' | 'sm' }) {
  const { t, profile, toast } = useApp();
  const [status, setStatus] = useState<SpeechStatus>('checking');
  useEffect(() => {
    let alive = true;
    void speechStatus().then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <button
      className={`speakBtn ${size}${status === 'missing' ? ' off' : ''}`}
      data-testid={`speak-${word}`}
      data-status={status}
      aria-label={t('speech.listen')}
      title={t('speech.listen')}
      onClick={async (e) => {
        e.stopPropagation();
        if (status === 'missing') {
          toast(t('speech.missing'));
          return;
        }
        const ok = await speak(word, profile.speechRate);
        if (!ok) toast(t('speech.missing'));
      }}
    >
      {SPEAKER}
    </button>
  );
}
