import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { isNative } from '../platform/native';
import { fullscreenSupported, isWebFullscreen, onWebFullscreenChange, setFullscreen } from '../platform/fullscreen';

const ENTER = (
  <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);
const LEAVE = (
  <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
  </svg>
);

/** Whether full screen is on now (APK: saved setting; web: the page state). */
export function useFullscreen(): [boolean, () => void] {
  const { settings, updateSettings, feel } = useApp();
  const [webOn, setWebOn] = useState(isWebFullscreen());
  useEffect(() => onWebFullscreenChange(setWebOn), []);
  const on = isNative ? settings.fullscreen : webOn;
  const toggle = () => {
    feel('light');
    void setFullscreen(!on).then((now) => {
      if (isNative) updateSettings({ fullscreen: now });
      else setWebOn(now);
    });
  };
  return [on, toggle];
}

export function FullscreenButton() {
  const { t, click } = useApp();
  const [on, toggle] = useFullscreen();
  if (!fullscreenSupported) return null;
  return (
    <button
      className="iconBtn"
      data-testid="fullscreen-btn"
      data-on={on ? '1' : '0'}
      aria-label={t(on ? 'fullscreen.leave' : 'fullscreen.enter')}
      title={t(on ? 'fullscreen.leave' : 'fullscreen.enter')}
      onClick={() => {
        click();
        toggle();
      }}
    >
      {on ? LEAVE : ENTER}
    </button>
  );
}
