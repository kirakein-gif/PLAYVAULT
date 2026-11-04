import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useApp } from '../state';
import { Icon } from './icons';

export function Btn(props: {
  children: ReactNode;
  onClick?: () => void;
  kind?: 'gold' | 'dark' | 'ghost' | 'danger';
  size?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  testId?: string;
  title?: string;
}) {
  const { click } = useApp();
  return (
    <button
      className={`btn ${props.kind ?? 'dark'} ${props.size ?? 'md'} ${props.className ?? ''}`}
      disabled={props.disabled}
      data-testid={props.testId}
      title={props.title}
      onClick={() => {
        click();
        props.onClick?.();
      }}
    >
      {props.icon && <span className="btnIcon">{props.icon}</span>}
      <span className="btnLabel">{props.children}</span>
    </button>
  );
}

export function TopBar({ title, right, onBack }: { title: ReactNode; right?: ReactNode; onBack?: () => void }) {
  const { back, click } = useApp();
  return (
    <header className="topbar">
      <button
        className="iconBtn"
        aria-label="back"
        data-testid="back"
        onClick={() => {
          click();
          (onBack ?? back)();
        }}
      >
        {Icon.back}
      </button>
      <h1 className="topTitle">{title}</h1>
      <div className="topRight">{right}</div>
    </header>
  );
}

export function LangToggle({ compact }: { compact?: boolean }) {
  const { lang, setLang, click } = useApp();
  if (compact)
    return (
      <button className="iconBtn langMini" data-testid="lang-toggle" aria-label="language" onClick={() => { click(); setLang(lang === 'ko' ? 'en' : 'ko'); }}>
        {lang === 'ko' ? 'EN' : '한'}
      </button>
    );
  return (
    <button
      className="langToggle"
      data-testid="lang-toggle"
      onClick={() => {
        click();
        setLang(lang === 'ko' ? 'en' : 'ko');
      }}
    >
      <span className={lang === 'ko' ? 'on' : ''}>한국어</span>
      <span className="sep">/</span>
      <span className={lang === 'en' ? 'on' : ''}>EN</span>
    </button>
  );
}

export function SettingsButton() {
  const { openSettings, click } = useApp();
  return (
    <button
      className="iconBtn"
      aria-label="settings"
      data-testid="settings-btn"
      onClick={() => {
        click();
        openSettings(true);
      }}
    >
      {Icon.gear}
    </button>
  );
}

export function Modal({ title, children, onClose, actions, wide }: { title?: ReactNode; children?: ReactNode; onClose?: () => void; actions?: ReactNode; wide?: boolean }) {
  return (
    <div className="modalBack" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog">
        {title && <h2 className="modalTitle">{title}</h2>}
        <div className="modalBody">{children}</div>
        {actions && <div className="modalActions">{actions}</div>}
      </div>
    </div>
  );
}

export function Confirm({ text, onYes, onNo, yes, no }: { text: ReactNode; onYes: () => void; onNo: () => void; yes?: string; no?: string }) {
  const { t } = useApp();
  return (
    <Modal
      onClose={onNo}
      actions={
        <>
          <Btn kind="ghost" onClick={onNo} testId="confirm-no">
            {no ?? t('common.cancel')}
          </Btn>
          <Btn kind="gold" onClick={onYes} testId="confirm-yes">
            {yes ?? t('common.confirm')}
          </Btn>
        </>
      }
    >
      <p className="confirmText">{text}</p>
    </Modal>
  );
}

export function Toggle({ on, onChange, testId }: { on: boolean; onChange: (v: boolean) => void; testId?: string }) {
  const { click } = useApp();
  return (
    <button
      className={`toggle${on ? ' on' : ''}`}
      role="switch"
      aria-checked={on}
      data-testid={testId}
      onClick={() => {
        click();
        onChange(!on);
      }}
    >
      <span className="knob" />
    </button>
  );
}

/** Measures an element and returns the largest square board size that fits. */
export function useFitSize<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize(Math.max(160, Math.floor(Math.min(r.width, r.height))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

export function useInterval(fn: () => void, ms: number | null) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}
