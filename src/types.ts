/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Point {
  x: number;
  y: number;
}

export interface Tetromino {
  type: PieceType;
  matrix: number[][];
  colorClass: string; // Tailwind class name representing monochrome style/pattern
  patternId: string;   // Unique pattern identifier for styling
}

export type Grid = (PieceType | null)[][];

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  highScore: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Tetromino definitions with shapes and custom B&W pattern descriptions
export const TETROMINOS: Record<PieceType, Tetromino> = {
  I: {
    type: 'I',
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    colorClass: 'bg-neutral-900 border-neutral-100 border-2', // Heavy black
    patternId: 'solid-dark',
  },
  O: {
    type: 'O',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    colorClass: 'bg-neutral-100 border-neutral-950 border-2', // Heavy white
    patternId: 'solid-light',
  },
  T: {
    type: 'T',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colorClass: 'bg-neutral-200 border-neutral-950 border-2 relative after:absolute after:inset-1 after:border after:border-dashed after:border-neutral-500', // Dashed border inset
    patternId: 'dashed-inset',
  },
  S: {
    type: 'S',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    colorClass: 'bg-neutral-950 border-neutral-100 border-2 relative after:absolute after:w-1.5 after:h-1.5 after:bg-neutral-100 after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2', // Center dot white
    patternId: 'center-dot-white',
  },
  Z: {
    type: 'Z',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    colorClass: 'bg-neutral-100 border-neutral-950 border-2 relative after:absolute after:w-1.5 after:h-1.5 after:bg-neutral-950 after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2', // Center dot black
    patternId: 'center-dot-black',
  },
  J: {
    type: 'J',
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colorClass: 'bg-neutral-800 border-neutral-100 border-2 relative overflow-hidden before:absolute before:inset-0 before:bg-[linear-gradient(45deg,#fff_12.5%,transparent_12.5%,transparent_50%,#fff_50%,#fff_62.5%,transparent_62.5%,transparent_100%)] before:bg-[length:4px_4px]', // Striped dark
    patternId: 'striped-dark',
  },
  L: {
    type: 'L',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colorClass: 'bg-neutral-100 border-neutral-950 border-2 relative overflow-hidden before:absolute before:inset-0 before:bg-[linear-gradient(45deg,#000_12.5%,transparent_12.5%,transparent_50%,#000_50%,#000_62.5%,transparent_62.5%,transparent_100%)] before:bg-[length:4px_4px]', // Striped light
    patternId: 'striped-light',
  },
};
