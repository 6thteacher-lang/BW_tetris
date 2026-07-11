/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameStats } from '../types';

interface StatsPanelProps {
  stats: GameStats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  // Pad numbers with leading zeros for retro console feel
  const formatNumber = (num: number, digits: number = 6): string => {
    return num.toString().padStart(digits, '0');
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* High Score Panel (Minimalist block) */}
      <div className="group">
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2 font-mono">
          HI-SCORE RECORD
        </div>
        <div className="text-3xl font-bold border-l-4 border-white pl-4 font-retro tracking-tighter text-white">
          {formatNumber(stats.highScore)}
        </div>
      </div>

      {/* Main Stats Group */}
      <div className="flex flex-col gap-6">
        {/* Score */}
        <div className="group">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2 font-mono">
            CURRENT SCORE
          </div>
          <div className="text-4xl font-bold border-l-4 border-white pl-4 font-retro tracking-tighter text-white group-hover:bg-white group-hover:text-black transition-colors">
            {formatNumber(stats.score)}
          </div>
        </div>

        {/* Level */}
        <div className="group">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2 font-mono">
            ACTIVE LEVEL
          </div>
          <div className="text-4xl font-bold border-l-4 border-white pl-4 font-retro tracking-tighter text-white">
            {stats.level.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Lines */}
        <div className="group">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2 font-mono">
            LINES CLEARED
          </div>
          <div className="text-4xl font-bold border-l-4 border-white pl-4 font-retro tracking-tighter text-white">
            {stats.lines.toString().padStart(3, '0')}
          </div>
        </div>
      </div>

      {/* Quick Legend Guide (Desktop Only) */}
      <div className="hidden lg:block border-2 border-white/20 bg-black p-4 text-[11px] leading-relaxed font-mono">
        <div className="text-white text-[10px] uppercase tracking-[0.2em] opacity-40 mb-3 font-mono">INPUT CONFIG</div>
        <div className="space-y-2 text-[11px] uppercase">
          <div className="flex justify-between border-b border-white/10 pb-1"><span>Move</span><span>Arrow Keys / A,D</span></div>
          <div className="flex justify-between border-b border-white/10 pb-1"><span>Rotate</span><span>Space / Z,X</span></div>
          <div className="flex justify-between border-b border-white/10 pb-1"><span>Soft Drop</span><span>Down / S</span></div>
          <div className="flex justify-between border-b border-white/10 pb-1"><span>Hard Drop</span><span>Space / Up</span></div>
          <div className="flex justify-between border-b border-white/10 pb-1"><span>Hold Swap</span><span>C / Shift</span></div>
        </div>
      </div>
    </div>
  );
};
