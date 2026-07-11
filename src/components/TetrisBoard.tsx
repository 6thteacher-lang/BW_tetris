/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  Grid,
  Tetromino,
  Point,
  TETROMINOS,
  GameStatus,
} from '../types';

interface TetrisBoardProps {
  grid: Grid;
  currentPiece: Tetromino | null;
  currentPos: Point;
  ghostPos: Point;
  clearingRows: number[];
  scoreNotification: string | null;
  status: GameStatus;
  shaking: boolean;
  onStartClick: () => void;
}

// Map pattern ID to styling classes defined in index.css
const patternToClassMap: Record<string, string> = {
  'solid-dark': 'block-solid-dark',
  'solid-light': 'block-solid-light',
  'dashed-inset': 'block-dashed-inset',
  'center-dot-white': 'block-center-dot-white',
  'center-dot-black': 'block-center-dot-black',
  'striped-dark': 'block-striped-dark',
  'striped-light': 'block-striped-light',
};

export const TetrisBoard: React.FC<TetrisBoardProps> = ({
  grid,
  currentPiece,
  currentPos,
  ghostPos,
  clearingRows,
  scoreNotification,
  status,
  shaking,
  onStartClick,
}) => {
  // Combine board, falling piece, and ghost piece into a display grid
  const renderGrid = (): { type: 'empty' | 'landed' | 'falling' | 'ghost'; styleClass: string }[][] => {
    // Start with empty grid
    const display: { type: 'empty' | 'landed' | 'falling' | 'ghost'; styleClass: string }[][] = Array.from(
      { length: BOARD_HEIGHT },
      () => Array(BOARD_WIDTH).fill({ type: 'empty', styleClass: '' })
    );

    // 1. Populate landed cells from grid
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        const cell = grid[r][c];
        if (cell) {
          const patternId = TETROMINOS[cell].patternId;
          display[r][c] = {
            type: 'landed',
            styleClass: patternToClassMap[patternId] || '',
          };
        }
      }
    }

    // 2. Populate ghost piece cells (only when game is active)
    if (currentPiece && status === 'PLAYING') {
      const { matrix, patternId } = currentPiece;
      const size = matrix.length;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c] !== 0) {
            const boardY = ghostPos.y + r;
            const boardX = ghostPos.x + c;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              // Only draw ghost if the cell is not already a landed block
              if (display[boardY][boardX].type === 'empty') {
                display[boardY][boardX] = {
                  type: 'ghost',
                  styleClass: 'block-ghost',
                };
              }
            }
          }
        }
      }
    }

    // 3. Populate active falling piece cells
    if (currentPiece && status === 'PLAYING') {
      const { matrix, patternId } = currentPiece;
      const size = matrix.length;
      const styleClass = patternToClassMap[patternId] || '';

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c] !== 0) {
            const boardY = currentPos.y + r;
            const boardX = currentPos.x + c;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              display[boardY][boardX] = {
                type: 'falling',
                styleClass,
              };
            }
          }
        }
      }
    }

    return display;
  };

  const boardCells = renderGrid();

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[1/2] mx-auto">
      {/* Outer game screen CRT frame */}
      <div
        id="tetris-game-board-container"
        className={`w-full h-full border-2 border-white bg-black p-1.5 flex flex-col relative transition-transform ${
          shaking ? 'shake-effect' : ''
        }`}
      >
        {/* The Grid */}
        <div className="grid grid-cols-10 gap-[1px] bg-neutral-900 border border-neutral-800 p-[1px] w-full h-full relative z-0">
          {boardCells.map((row, rIdx) => {
            const isClearing = clearingRows.includes(rIdx);
            return row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`pattern-grid-cell ${
                  isClearing
                    ? 'bg-white border-2 border-white animate-flash z-10'
                    : cell.type !== 'empty'
                    ? cell.styleClass
                    : 'bg-neutral-950/90 border border-neutral-900/25'
                }`}
              >
                {/* Visual mesh dots for empty board slots */}
                {cell.type === 'empty' && (
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-neutral-800 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30" />
                )}
              </div>
            ));
          })}
        </div>

        {/* Floating arcade text alerts */}
        <AnimatePresence>
          {scoreNotification && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: -25, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-30 flex justify-center pointer-events-none"
            >
              <span className="font-mono text-[10px] md:text-xs text-black bg-white border border-black px-2.5 py-1.5 font-bold uppercase tracking-wider">
                {scoreNotification}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Play / Pause / Game Over overlays */}
        <AnimatePresence>
          {status === 'IDLE' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-20 flex flex-col items-center justify-center p-4 text-center"
            >
              <div className="font-retro text-base text-white mb-6 uppercase tracking-widest leading-relaxed">
                TETRIS
              </div>
              
              <div className="border border-white/20 p-3 mb-8 bg-neutral-950/50 max-w-[200px]">
                <p className="text-[9px] text-zinc-400 font-mono leading-relaxed uppercase">
                  AUTHENTIC BLACK & WHITE TETROMINO ENGINE
                </p>
              </div>

              <button
                id="btn-play-game-start"
                onClick={onStartClick}
                className="font-mono text-[10px] px-5 py-3 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-colors uppercase tracking-widest"
              >
                START GAME
              </button>
            </motion.div>
          )}

          {status === 'PAUSED' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-4"
            >
              <div className="font-retro text-xs text-white mb-4 uppercase tracking-widest">
                PAUSED
              </div>
              <p className="text-[10px] text-neutral-400 font-mono text-center mb-6 max-w-[160px] uppercase">
                Press P or ESC to Resume
              </p>
              <button
                id="btn-resume-game"
                onClick={onStartClick} // resumes game
                className="font-mono text-[9px] px-4 py-2.5 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-wider"
              >
                RESUME
              </button>
            </motion.div>
          )}

          {status === 'GAME_OVER' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-4 text-center"
            >
              <div className="font-retro text-xs text-white mb-2 uppercase tracking-wider text-white">
                GAME OVER
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mb-6 uppercase">
                A valiant performance!
              </p>
              <button
                id="btn-game-over-restart"
                onClick={onStartClick}
                className="font-mono text-[10px] px-4 py-3 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
