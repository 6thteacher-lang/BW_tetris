/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useTetris } from './hooks/useTetris';
import { RetroBezel } from './components/RetroBezel';
import { TetrisBoard } from './components/TetrisBoard';
import { MiniBoard, NextQueue } from './components/HoldNextPanel';
import { StatsPanel } from './components/StatsPanel';
import { Controls } from './components/Controls';
import { Play, RotateCcw, HelpCircle } from 'lucide-react';

export default function App() {
  const {
    grid,
    status,
    currentPiece,
    currentPos,
    ghostPos,
    nextPieces,
    holdPiece,
    stats,
    shaking,
    clearingRows,
    scoreNotification,
    startGame,
    togglePause,
    resetToIdle,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    hold,
  } = useTetris();

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent browser default scrolling actions for game controls
      const keysToBlock = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (keysToBlock.includes(event.code)) {
        event.preventDefault();
      }

      if (status !== 'PLAYING') {
        if (event.code === 'Enter' || event.key === 'r' || event.key === 'R') {
          startGame();
        }
        return;
      }

      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight();
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveDown();
          break;
        case 'ArrowUp':
        case 'KeyX':
          rotate(true); // Rotate Clockwise
          break;
        case 'KeyZ':
          rotate(false); // Rotate Counter-Clockwise
          break;
        case 'Space':
          hardDrop();
          break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          hold();
          break;
        case 'KeyP':
        case 'Escape':
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, startGame, moveLeft, moveRight, moveDown, rotate, hardDrop, hold, togglePause]);

  return (
    <div className="min-h-screen bg-black py-6 sm:py-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Retro Bezel Enclosure wrapping the game workspace */}
      <RetroBezel status={status} level={stats.level}>
        
        {/* Layout Grid: Responsive Desktop Columns vs Mobile Compact Rows */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-stretch relative">
          
          {/* ================= MOBILE COMPACT PANEL HEADER (Visible only on mobile/tablet) ================= */}
          <div className="md:hidden flex items-center justify-between gap-2 p-1.5 bg-black border-2 border-white rounded mb-1">
            <div className="flex gap-1.5">
              <MiniBoard type={holdPiece} label="HOLD" />
            </div>

            {/* Quick Mobile HUD Stats */}
            <div className="flex flex-col items-center justify-center px-4 py-2 border border-white/20 bg-neutral-950 flex-1">
              <span className="font-retro text-[7px] text-zinc-400">SCORE</span>
              <span className="font-retro text-[11px] text-white font-bold">{stats.score.toString().padStart(5, '0')}</span>
              <div className="flex gap-4 mt-1.5 border-t border-zinc-800 pt-1 w-full justify-around text-[7px] font-mono">
                <span>LV: {stats.level.toString().padStart(2, '0')}</span>
                <span>LINES: {stats.lines.toString().padStart(3, '0')}</span>
              </div>
            </div>

            <div className="flex gap-1.5">
              {nextPieces.length > 0 && <MiniBoard type={nextPieces[0]} label="NEXT" />}
            </div>
          </div>

          {/* ================= LEFT SIDEBAR (Desktop Only) ================= */}
          <div className="hidden md:flex md:col-span-3 flex-col justify-between gap-4">
            {/* Hold piece display */}
            <MiniBoard type={holdPiece} label="HOLD PIECE" />

            {/* Retro Manual Card */}
            <div className="border-2 border-white bg-black p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 border-b border-white/10 pb-2 mb-3 font-mono">
                  KEYBIND MANUAL
                </div>
                <ul className="text-[9px] font-mono text-zinc-300 space-y-2 leading-relaxed">
                  <li className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/15 text-[8px] font-mono text-white">A/D</span>
                    <span>MOVE PIECE</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/15 text-[8px] font-mono text-white">S</span>
                    <span>SOFT DROP</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/15 text-[8px] font-mono text-white">X/↑</span>
                    <span>ROTATE CW</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/15 text-[8px] font-mono text-white">Z</span>
                    <span>ROTATE CCW</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/15 text-[8px] font-mono text-white">SPACE</span>
                    <span>HARD DROP</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/15 text-[8px] font-mono text-white">SHIFT</span>
                    <span>SWAP HOLD</span>
                  </li>
                </ul>
              </div>

              {/* Reset to idle panel button */}
              {status === 'PLAYING' && (
                <button
                  id="btn-return-home"
                  onClick={resetToIdle}
                  className="mt-4 py-2 border border-white/30 text-neutral-400 font-mono text-[8px] hover:text-white hover:border-white transition-colors uppercase tracking-wider"
                >
                  ABORT RUN
                </button>
              )}
            </div>
          </div>

          {/* ================= CENTER COLUMN (Tetris Board & Controls) ================= */}
          <div className="md:col-span-6 flex flex-col justify-center items-center">
            
            {/* The actual Active Board view */}
            <TetrisBoard
              grid={grid}
              currentPiece={currentPiece}
              currentPos={currentPos}
              ghostPos={ghostPos}
              clearingRows={clearingRows}
              scoreNotification={scoreNotification}
              status={status}
              shaking={shaking}
              onStartClick={status === 'PAUSED' ? togglePause : startGame}
            />

            {/* On-screen control buttons (For mobile players, fully clickable on desktop) */}
            <Controls
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
              onMoveDown={moveDown}
              onRotateCW={() => rotate(true)}
              onRotateCCW={() => rotate(false)}
              onHardDrop={hardDrop}
              onHold={hold}
              onPause={togglePause}
              status={status}
            />
          </div>

          {/* ================= RIGHT SIDEBAR (Desktop Only) ================= */}
          <div className="hidden md:flex md:col-span-3 flex-col gap-4">
            {/* Stats list */}
            <StatsPanel stats={stats} />

            {/* Next queue sidebar */}
            <NextQueue queue={nextPieces} />
          </div>

        </div>
      </RetroBezel>

      {/* Floating subtle instructions at page bottom */}
      <div className="mt-4 font-mono text-[9px] text-zinc-500 uppercase tracking-widest text-center">
        <span>© 1989 TETROMINO EMULATION • INSPIRED BY MINIMAL BRUTALISM</span>
      </div>
    </div>
  );
}
