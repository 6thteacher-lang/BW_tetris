/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BOARD_WIDTH, BOARD_HEIGHT, Grid, PieceType, TETROMINOS, Tetromino, Point } from '../types';

// Create an empty game grid
export function createEmptyGrid(): Grid {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

// 7-Bag Generator: Shuffles all 7 tetrominos so each is guaranteed to appear once per bag
export class RandomBagGenerator {
  private bag: PieceType[] = [];

  public getNext(): PieceType {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    return this.bag.pop()!;
  }

  private refillBag() {
    const types: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    // Fisher-Yates shuffle
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    this.bag = types;
  }
}

// Checks if a piece fits in the grid at the given position (x, y)
export function checkCollision(
  matrix: number[][],
  pos: Point,
  grid: Grid
): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] !== 0) {
        const nextX = pos.x + c;
        const nextY = pos.y + r;

        // Check grid boundary collisions
        if (
          nextX < 0 ||
          nextX >= BOARD_WIDTH ||
          nextY >= BOARD_HEIGHT
        ) {
          return true;
        }

        // Only collide if it's within the playable area (nextY >= 0) and the spot is occupied
        if (nextY >= 0 && grid[nextY][nextX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// Rotates a matrix clockwise
export function rotateMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

// Rotates a matrix counter-clockwise
export function rotateMatrixCCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[n - 1 - c][r] = matrix[r][c];
    }
  }
  return result;
}

// Find the ghost piece Y position (where the piece would land if hard dropped)
export function getGhostPosition(
  matrix: number[][],
  pos: Point,
  grid: Grid
): Point {
  const ghostPos = { ...pos };
  while (!checkCollision(matrix, { x: ghostPos.x, y: ghostPos.y + 1 }, grid)) {
    ghostPos.y++;
  }
  return ghostPos;
}

// Wall kick helper: tries to resolve rotation collisions by shifting the piece slightly
// Returns the new position if successful, otherwise null
export function attemptRotationKick(
  matrix: number[][],
  pos: Point,
  grid: Grid
): Point | null {
  // Common kick translations to test: [dx, dy]
  const kicks = [
    { x: 0, y: 0 },   // Try normal rotation
    { x: -1, y: 0 },  // Try shifting left 1
    { x: 1, y: 0 },   // Try shifting right 1
    { x: 0, y: -1 },  // Try shifting up 1 (floor kick)
    { x: -2, y: 0 },  // Try shifting left 2 (mainly for I piece)
    { x: 2, y: 0 },   // Try shifting right 2 (mainly for I piece)
  ];

  for (const kick of kicks) {
    const testPos = { x: pos.x + kick.x, y: pos.y + kick.y };
    if (!checkCollision(matrix, testPos, grid)) {
      return testPos;
    }
  }

  return null;
}
