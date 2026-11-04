import type { Picture } from '../storage/schema';
import { BalloonScene } from './BalloonScene';
import { ClassicScene } from './ClassicScene';

/** The wrong-guess picture the player chose (Settings → Picture). */
export function Scene({ picture, lives, state }: { picture: Picture; lives: number; state: 'playing' | 'won' | 'lost' }) {
  return picture === 'classic' ? <ClassicScene lives={lives} state={state} /> : <BalloonScene lives={lives} state={state} />;
}
