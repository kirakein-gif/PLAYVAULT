// Large on-screen A-Z keys (QWERTY rows, the layout a child sees on a PC).
import type { ReactNode } from 'react';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export function LetterKeyboard({
  marks,
  onKey,
  disabled,
  extra,
}: {
  marks?: Record<string, 'hit' | 'miss'>;
  onKey: (letter: string) => void;
  disabled?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="keyboard" data-testid="keyboard">
      {ROWS.map((row, i) => (
        <div className="keyRow" key={row}>
          {[...row].map((l) => {
            const m = marks?.[l];
            return (
              <button
                key={l}
                className={`key${m ? ` ${m}` : ''}`}
                data-testid={`key-${l}`}
                disabled={disabled || !!m}
                onClick={() => onKey(l)}
              >
                {l.toUpperCase()}
              </button>
            );
          })}
          {i === ROWS.length - 1 && extra}
        </div>
      ))}
    </div>
  );
}

/** Maps a physical key event to a letter (uses event.code so a Korean IME state still works). */
export function letterFromKey(e: KeyboardEvent): string | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const m = /^Key([A-Z])$/.exec(e.code);
  return m ? m[1].toLowerCase() : null;
}
