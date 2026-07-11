/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, RotateCcw, Zap, HelpCircle, Volume2, VolumeX, Music, Moon, Sun } from 'lucide-react';
import { gameAudio } from '../audio';

interface ControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onPause: () => void;
  status: 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
}

export const Controls: React.FC<ControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotateCW,
  onRotateCCW,
  onHardDrop,
  onHold,
  onPause,
  status,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Sync mute state with physical audio controller
  useEffect(() => {
    setIsMuted(gameAudio.getMuteStatus());
    setIsMusicOn(gameAudio.getMusicStatus());
  }, []);

  const handleMuteToggle = () => {
    const nextMute = gameAudio.toggleMute();
    setIsMuted(nextMute);
  };

  const handleMusicToggle = () => {
    if (isMusicOn) {
      gameAudio.stopMusic();
      setIsMusicOn(false);
    } else {
      gameAudio.startMusic();
      setIsMusicOn(true);
    }
  };

  if (status !== 'PLAYING') {
    // Only render clean settings block during start screens
    return (
      <div className="w-full max-w-sm mx-auto flex justify-center gap-4 mt-2">
        <button
          id="btn-toggle-sound"
          onClick={handleMuteToggle}
          className="border-2 border-white bg-black hover:bg-white hover:text-black transition-colors px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-white"
        >
          {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
        </button>
        <button
          id="btn-toggle-music"
          onClick={handleMusicToggle}
          className="border-2 border-white bg-black hover:bg-white hover:text-black transition-colors px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-white"
        >
          {isMusicOn ? 'MUSIC: ON' : 'MUSIC: OFF'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4 mt-3 px-2 select-none">
      {/* Action Controller Grid: Flat minimal layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Side: Sharp D-Pad */}
        <div className="grid grid-cols-3 gap-2">
          {/* Top row spacer */}
          <div />
          <button
            id="pad-btn-hold-quick"
            onClick={onHold}
            className="border-2 border-white/25 bg-black hover:bg-white hover:text-black text-white py-2 flex items-center justify-center text-[9px] font-mono font-bold uppercase transition-all"
            title="Hold Piece"
          >
            HOLD
          </button>
          <div />

          {/* Middle Row: Left & Right */}
          <button
            id="pad-btn-left"
            onTouchStart={(e) => { e.preventDefault(); onMoveLeft(); }}
            onClick={onMoveLeft}
            className="border-2 border-white bg-black hover:bg-white hover:text-black text-white p-3 flex items-center justify-center transition-all"
            title="Move Left"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            id="pad-btn-down"
            onTouchStart={(e) => { e.preventDefault(); onMoveDown(); }}
            onClick={onMoveDown}
            className="border-2 border-white bg-black hover:bg-white hover:text-black text-white p-3 flex items-center justify-center transition-all"
            title="Soft Drop"
          >
            <ArrowDown size={16} />
          </button>
          <button
            id="pad-btn-right"
            onTouchStart={(e) => { e.preventDefault(); onMoveRight(); }}
            onClick={onMoveRight}
            className="border-2 border-white bg-black hover:bg-white hover:text-black text-white p-3 flex items-center justify-center transition-all"
            title="Move Right"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Right Side: Primary Actions */}
        <div className="flex flex-col gap-2 justify-center">
          <div className="grid grid-cols-2 gap-2">
            <button
              id="pad-btn-rotate-ccw"
              onTouchStart={(e) => { e.preventDefault(); onRotateCCW(); }}
              onClick={onRotateCCW}
              className="border-2 border-white bg-black hover:bg-white hover:text-black text-white py-3 flex flex-col items-center justify-center transition-all"
              title="Rotate Counter-Clockwise"
            >
              <RotateCcw size={16} />
              <span className="text-[7px] font-mono mt-1 font-bold">ROT_L</span>
            </button>

            <button
              id="pad-btn-rotate-cw"
              onTouchStart={(e) => { e.preventDefault(); onRotateCW(); }}
              onClick={onRotateCW}
              className="border-2 border-white bg-white hover:bg-black hover:text-white text-black py-3 flex flex-col items-center justify-center transition-all"
              title="Rotate Clockwise"
            >
              <RotateCw size={16} />
              <span className="text-[7px] font-mono mt-1 font-bold">ROT_R</span>
            </button>
          </div>

          <button
            id="pad-btn-hard-drop"
            onTouchStart={(e) => { e.preventDefault(); onHardDrop(); }}
            onClick={onHardDrop}
            className="w-full py-2.5 bg-white text-black border-2 border-white hover:bg-black hover:text-white font-mono text-[10px] font-black flex items-center justify-center gap-1.5 transition-all"
            title="Instant Hard Drop"
          >
            <Zap size={11} className="fill-current" />
            HARD DROP
          </button>
        </div>
      </div>

      {/* Auxiliary Control Row: Hold, Pause, Music, Sound */}
      <div className="flex justify-between items-center bg-neutral-950 p-2.5 border border-white/20">
        <button
          id="pad-btn-hold"
          onClick={onHold}
          className="px-3 py-1.5 border border-white hover:bg-white hover:text-black transition-colors font-mono text-[9px] uppercase tracking-wider"
        >
          SWAP HOLD (C)
        </button>

        <button
          id="pad-btn-pause"
          onClick={onPause}
          className="px-3 py-1.5 border border-white hover:bg-white hover:text-black transition-colors font-mono text-[9px] uppercase tracking-wider"
        >
          PAUSE (P)
        </button>

        <div className="flex gap-1.5">
          <button
            id="btn-fast-mute"
            onClick={handleMuteToggle}
            className="p-1.5 border border-white/10 bg-black text-white hover:bg-white hover:text-black transition-all"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <button
            id="btn-fast-music"
            onClick={handleMusicToggle}
            className="p-1.5 border border-white/10 bg-black text-white hover:bg-white hover:text-black transition-all"
            title="Toggle Music"
          >
            <Music size={13} className={isMusicOn ? 'text-white' : 'text-neutral-500'} />
          </button>

          <button
            id="btn-fast-help"
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 border border-white/10 bg-black text-white hover:bg-white hover:text-black transition-all"
            title="Show Help"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </div>

      {/* Help Modal Overlay inline */}
      {showHelp && (
        <div className="bg-black border-2 border-white p-3 text-white text-[9px] font-mono leading-normal">
          <div className="text-[10px] text-white uppercase mb-2 border-b border-white/20 pb-1 flex justify-between">
            <span>Play Instructions</span>
            <button onClick={() => setShowHelp(false)} className="text-white font-bold hover:underline">CLOSE</button>
          </div>
          <p className="mb-1">• Fill rows completely with blocks to clear them and score.</p>
          <p className="mb-1">• Levels speed up. Set higher scores to claim the high score throne.</p>
          <p>• Desktop: Use ←/→ Arrow Keys, Rotate (↑/Z/X), Hard Drop (Space), Hold (C/Shift), Pause (P).</p>
        </div>
      )}
    </div>
  );
};
