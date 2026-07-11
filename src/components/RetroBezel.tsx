/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameStatus } from '../types';

interface RetroBezelProps {
  children: React.ReactNode;
  status: GameStatus;
  level: number;
}

export const RetroBezel: React.FC<RetroBezelProps> = ({ children, status, level }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-center items-center">
      {/* Outer container: Flat black frame with crisp double border */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl bg-black border-[3px] border-white p-6 sm:p-8 relative overflow-hidden flex flex-col items-center">
        
        {/* Subtle dot matrix grid background inside the bezel for texture */}
        <div className="absolute inset-0 dither-bg opacity-10 pointer-events-none z-0" />

        {/* Console Header / Meta Bar matching Clean Minimalism */}
        <div className="w-full flex justify-between items-end border-b-2 border-white pb-3 mb-8 relative z-10">
          <div className="flex flex-col">
            <h1 className="font-retro text-base sm:text-lg md:text-xl font-black tracking-tighter leading-none text-white uppercase">
              TETRIS.ARCADE
            </h1>
            <span className="text-[9px] font-mono opacity-50 mt-1 uppercase tracking-wider">
              SYSTEM_V2.4 // PROTOCOL_MINIMAL
            </span>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="text-[9px] font-mono uppercase tracking-widest opacity-50">Host Status</div>
            <div className="text-xs font-mono text-white flex items-center gap-2">
              <span>CONNECTED // GITHUB_PAGES</span>
              <div 
                className={`w-2 h-2 border border-white transition-all duration-300 ${
                  status === 'PLAYING' 
                    ? 'bg-white animate-pulse' 
                    : 'bg-transparent'
                }`} 
              />
            </div>
          </div>
        </div>

        {/* Inner LCD Board Screen with pristine minimalist frame */}
        <div className="w-full bg-black border-2 border-zinc-800 p-2 sm:p-4 relative z-10">
          {children}
        </div>

        {/* Bottom Status Footer from the requested Design HTML */}
        <div className="w-full mt-6 flex justify-between items-center text-[9px] opacity-30 uppercase tracking-[0.2em] font-mono z-10">
          <div>CPU_LOAD: 02%</div>
          <div className="hidden sm:block">Latency: 01ms</div>
          <div className="hidden sm:block">Input_Buffer: EMPTY</div>
          <div>© 2026 MONO_WORKS.GIT</div>
        </div>
      </div>
    </div>
  );
};
