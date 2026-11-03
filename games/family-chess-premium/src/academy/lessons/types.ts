import type { Bi } from '../../i18n/i18n';

export interface LessonTask {
  /** accepted SAN moves (any checkmate is accepted when mate=true) */
  accept: string[];
  mate?: boolean;
  /** opponent reply played after a correct move (SAN) */
  reply?: string;
  success: Bi;
  /** feedback for a specific tempting wrong move (SAN -> text) */
  wrong?: Record<string, Bi>;
}

export interface LessonStep {
  /** SAN moves from the initial position, or a FEN */
  pre?: string;
  fen?: string;
  text: Bi;
  detail?: Bi;
  highlights?: string[];
  arrows?: [string, string][];
  /** SAN moves shown with "show the move" (from this step's position) */
  demo?: string;
  task?: LessonTask;
  orientation?: 'w' | 'b';
}

export interface Lesson {
  id: string;
  course: 'strategy' | 'openings' | 'endgames' | 'rules';
  title: Bi;
  summary: Bi;
  steps: LessonStep[];
}
