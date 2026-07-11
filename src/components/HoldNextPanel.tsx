/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PieceType, TETROMINOS } from '../types';

interface MiniBoardProps {
  type: PieceType | null;
  label: string;
}

// Map patternId to block classes
const patternToClassMap: Record<string, string> = {
  'solid-dark': 'block-solid-dark',
  'solid-light': 'block-solid-light',
  'dashed-inset': 'block-dashed-inset',
  'center-dot-white': 'block-center-dot-white',
  'center-dot-black': 'block-center-dot-black',
  'striped-dark': 'block-striped-dark',
  'striped-light': 'block-striped-light',
};

export const MiniBoard: React.FC<MiniBoardProps> = ({ type, label }) => {
  // Create a default 4x4 grid to center the tetromino
  const displayGrid = Array.from({ length: 4 }, () => Array(4).fill(0));

  if (type) {
    const proto = TETROMINOS[type];
    const matrix = proto.matrix;
    const size = matrix.length;
    
    // Center logic based on piece shape to make previews perfectly balanced
    let startRow = Math.floor((4 - size) / 2);
    let startCol = Math.floor((4 - size) / 2);

    // Adjust specific piece alignments for perfect optical centering
    if (type === 'I') {
      startRow = 0; // I is centered better when sitting high
    } else if (type === 'O') {
      startRow = 1;
      startCol = 1;
    } else if (type === 'T' || type === 'S' || type === 'Z' || type === 'J' || type === 'L') {
      startRow = 1;
      startCol = 1;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] !== 0) {
          const targetR = startRow + r;
          const targetC = startCol + c;
          if (targetR >= 0 && targetR < 4 && targetC >= 0 && targetC < 4) {
            displayGrid[targetR][targetC] = 1;
          }
        }
      }
    }
  }

  const activePatternClass = type ? patternToClassMap[TETROMINOS[type].patternId] : '';

  return (
    <div className="flex flex-col items-start w-full">
      <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2 font-mono">
        {label}
      </div>
      <div className="w-full aspect-square border-2 border-white bg-neutral-950 p-4 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-1">
          {displayGrid.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  cell !== 0
                    ? `${activePatternClass}`
                    : 'bg-transparent border border-white/5'
                }`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface NextQueueProps {
  queue: PieceType[];
}

export const NextQueue: React.FC<NextQueueProps> = ({ queue }) => {
  // Take next 3 pieces from the queue
  const visibleQueue = queue.slice(0, 3);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2 font-mono">
        NEXT PIECES
      </div>
      <div className="border-2 border-white bg-black p-3 flex flex-col gap-3">
        {visibleQueue.map((type, idx) => {
          const displayGrid = Array.from({ length: 3 }, () => Array(4).fill(0));
          const proto = TETROMINOS[type];
          const matrix = proto.matrix;
          const size = matrix.length;

          // Center piece in a 3x4 layout for compact side queuing
          let startRow = 1;
          let startCol = 1;
          
          if (type === 'I') {
            startRow = 1;
            startCol = 0;
          } else if (type === 'O') {
            startRow = 0.5;
            startCol = 1;
          }

          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (matrix[r][c] !== 0) {
                const targetR = Math.floor(startRow + r);
                const targetC = Math.floor(startCol + c);
                if (targetR >= 0 && targetR < 3 && targetC >= 0 && targetC < 4) {
                  displayGrid[targetR][targetC] = 1;
                }
              }
            }
          }

          const activePatternClass = patternToClassMap[proto.patternId];

          return (
            <div 
              key={`${type}-${idx}`} 
              className={`p-2 bg-neutral-950 border border-white/10 flex items-center justify-center transition-all ${
                idx === 0 ? 'opacity-100' : idx === 1 ? 'opacity-70' : 'opacity-45'
              }`}
            >
              <div className="grid grid-cols-4 gap-1">
                {displayGrid.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-4 h-4 ${
                        cell !== 0
                          ? activePatternClass
                          : 'bg-transparent'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
