import { STRATEGY } from './strategy';
import { OPENINGS } from './openings';
import { ENDGAMES } from './endgames';
import { RULES } from './rules';
import type { Lesson } from './types';

export const LESSONS: Lesson[] = [...STRATEGY, ...OPENINGS, ...ENDGAMES, ...RULES];
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonsOf = (course: Lesson['course']) => LESSONS.filter((l) => l.course === course);
export type { Lesson, LessonStep, LessonTask } from './types';
