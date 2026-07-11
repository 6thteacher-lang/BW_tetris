/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioController {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private musicVolume: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private bgMusicInterval: any = null;
  private beatCount: number = 0;

  constructor() {
    // AudioContext is lazily initialized on user interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.15, this.ctx.currentTime); // keep overall volume comfortable
      this.masterVolume.connect(this.ctx.destination);

      this.musicVolume = this.ctx.createGain();
      this.musicVolume.gain.setValueAtTime(0.08, this.ctx.currentTime); // music slightly quieter
      this.musicVolume.connect(this.masterVolume);
    } catch (e) {
      console.warn('Web Audio API not supported in this browser', e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuteStatus(): boolean {
    return this.isMuted;
  }

  public getMusicStatus(): boolean {
    return this.isMusicPlaying;
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, gainVals: number[]): { osc: OscillatorNode; gain: GainNode } | null {
    this.init();
    if (!this.ctx || this.isMuted) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(gainVals[0], this.ctx.currentTime);
    const step = duration / (gainVals.length - 1);
    for (let i = 1; i < gainVals.length; i++) {
      gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainVals[i]), this.ctx.currentTime + i * step);
    }

    osc.connect(gainNode);
    gainNode.connect(this.masterVolume!);

    return { osc, gain: gainNode };
  }

  public playMove() {
    const s = this.createOscillator('square', 120, 0.05, [0.4, 0.01]);
    if (!s) return;
    s.osc.start();
    s.osc.stop(this.ctx!.currentTime + 0.05);
  }

  public playRotate() {
    const s = this.createOscillator('triangle', 200, 0.08, [0.3, 0.2, 0.01]);
    if (!s) return;
    s.osc.frequency.exponentialRampToValueAtTime(350, this.ctx!.currentTime + 0.08);
    s.osc.start();
    s.osc.stop(this.ctx!.currentTime + 0.08);
  }

  public playLand() {
    // Creates a small B&W noise burst + low thud
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // 1. Bass thud
    const s = this.createOscillator('triangle', 80, 0.1, [0.6, 0.01]);
    if (s) {
      s.osc.start();
      s.osc.stop(this.ctx.currentTime + 0.1);
    }

    // 2. Small white noise burst
    try {
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(this.masterVolume!);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.04);
    } catch (err) {
      // Fallback
    }
  }

  public playLineClear() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.06;
      setTimeout(() => {
        const s = this.createOscillator('square', freq, 0.15, [0.3, 0.15, 0.01]);
        if (s) {
          s.osc.start();
          s.osc.stop(this.ctx!.currentTime + 0.15);
        }
      }, timeOffset * 1000);
    });
  }

  public playTetrisClear() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Massive major arpeggio and chord combo
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [329.63, 415.30, 493.88, 659.25], // E Major
    ];

    chords.forEach((chord, chordIdx) => {
      chord.forEach((freq, noteIdx) => {
        const timeOffset = chordIdx * 0.15 + noteIdx * 0.04;
        setTimeout(() => {
          const s = this.createOscillator('triangle', freq, 0.25, [0.4, 0.2, 0.01]);
          if (s) {
            s.osc.start();
            s.osc.stop(this.ctx!.currentTime + 0.25);
          }
        }, timeOffset * 1000);
      });
    });
  }

  public playLevelUp() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const notes = [349.23, 440.00, 523.25, 587.33, 659.25, 698.46]; // F4, A4, C5, D5, E5, F5
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.08;
      setTimeout(() => {
        const s = this.createOscillator('square', freq, 0.2, [0.3, 0.1, 0.01]);
        if (s) {
          s.osc.start();
          s.osc.stop(this.ctx!.currentTime + 0.2);
        }
      }, timeOffset * 1000);
    });
  }

  public playGameOver() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const notes = [293.66, 277.18, 261.63, 246.94, 220.00]; // D4, C#4, C4, B3, A3
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.15;
      setTimeout(() => {
        const s = this.createOscillator('sawtooth', freq, 0.3, [0.3, 0.1, 0.001]);
        if (s) {
          s.osc.start();
          s.osc.stop(this.ctx!.currentTime + 0.3);
        }
      }, timeOffset * 1000);
    });
  }

  // Beautifully sequenced minimalist pocket operator/B&W style melody
  public startMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.beatCount = 0;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // A classic retro sounding 8-bit Tetris loop (Korobeiniki inspired but custom-minimalist so it is non-distracting)
    // Notes: [Note name, octave, type(0=bass, 1=lead, 2=off)]
    const melody = [
      // Bar 1
      [329.63, 'lead'], [246.94, 'lead'], [261.63, 'lead'], [293.66, 'lead'], 
      [261.63, 'lead'], [246.94, 'lead'], [220.00, 'lead'], [220.00, 'lead'],
      [261.63, 'lead'], [329.63, 'lead'], [293.66, 'lead'], [261.63, 'lead'],
      [246.94, 'lead'], [246.94, 'lead'], [261.63, 'lead'], [293.66, 'lead'],
      // Bar 2
      [329.63, 'lead'], [261.63, 'lead'], [220.00, 'lead'], [220.00, 'lead'],
      [293.66, 'lead'], [349.23, 'lead'], [440.00, 'lead'], [392.00, 'lead'],
      [349.23, 'lead'], [329.63, 'lead'], [261.63, 'lead'], [329.63, 'lead'],
      [293.66, 'lead'], [261.63, 'lead'], [246.94, 'lead'], [246.94, 'lead'],
    ];

    const bassLine = [
      110.00, 110.00, 110.00, 110.00,
      130.81, 130.81, 130.81, 130.81,
      146.83, 146.83, 146.83, 146.83,
      123.47, 123.47, 123.47, 123.47,
    ];

    const tempoMs = 180; // 180ms per 8th note

    this.bgMusicInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      if (this.ctx.state === 'suspended') return;

      const idx = this.beatCount % melody.length;
      const [freq, role] = melody[idx];

      // Play lead melody (every other beat to make it breathable)
      if (idx % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle'; // triangle is softer, perfect for background
        osc.frequency.setValueAtTime(freq as number, this.ctx.currentTime);
        
        gain.connect(this.musicVolume!);
        osc.connect(gain);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      }

      // Play bassline (on the beat of quarter notes)
      if (idx % 4 === 0) {
        const bassIdx = Math.floor(idx / 2) % bassLine.length;
        const bassFreq = bassLine[bassIdx];
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square'; // square bass
        osc.frequency.setValueAtTime(bassFreq, this.ctx.currentTime);
        
        gain.connect(this.musicVolume!);
        osc.connect(gain);
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      }

      // Play a tiny retro click hi-hat on offbeats
      if (idx % 4 === 2) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(10000, this.ctx.currentTime); // ultra high frequency click
        gain.connect(this.musicVolume!);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.02);
      }

      this.beatCount++;
    }, tempoMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
  }

  public resumeContextIfSuspended() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

export const gameAudio = new AudioController();
