import data from './puzzles.json';
import type { Puzzle, PuzzleCategory } from '../types';

export const PUZZLES = data as unknown as Puzzle[];
export const puzzleById = (id: string) => PUZZLES.find((p) => p.id === id);
export const puzzleNumber = (id: string) => PUZZLES.findIndex((p) => p.id === id) + 1;

export type Course = 'tactics' | 'checkmate' | 'endgames' | 'all';
export const COURSE_CATEGORIES: Record<Course, PuzzleCategory[]> = {
  tactics: ['fork', 'pin', 'skewerDiscovered', 'defense'],
  checkmate: ['mate'],
  endgames: ['endgame'],
  all: ['mate', 'fork', 'pin', 'skewerDiscovered', 'defense', 'endgame'],
};
export const puzzlesOfCourse = (c: Course) => PUZZLES.filter((p) => COURSE_CATEGORIES[c].includes(p.category));
