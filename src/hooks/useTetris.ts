/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  Grid,
  PieceType,
  Tetromino,
  GameStats,
  GameStatus,
  Point,
  TETROMINOS,
} from '../types';
import {
  createEmptyGrid,
  RandomBagGenerator,
  checkCollision,
  rotateMatrix,
  rotateMatrixCCW,
  attemptRotationKick,
  getGhostPosition,
} from '../utils/tetrisHelpers';
import { gameAudio } from '../audio';

export function useTetris() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [status, setStatus] = useState<GameStatus>('IDLE');
  
  // Game pieces state
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [currentPos, setCurrentPos] = useState<Point>({ x: 0, y: 0 });
  const [nextPieces, setNextPieces] = useState<PieceType[]>([]);
  const [holdPiece, setHoldPiece] = useState<PieceType | null>(null);
  const [hasHeld, setHasHeld] = useState<boolean>(false);
  
  // Scoring / Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lines: 0,
    level: 1,
    highScore: 0,
  });

  // UI polish states
  const [shaking, setShaking] = useState<boolean>(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [scoreNotification, setScoreNotification] = useState<string | null>(null);

  // References for keeping state stable inside timers
  const bagGeneratorRef = useRef<RandomBagGenerator | null>(null);
  const currentPieceRef = useRef<Tetromino | null>(null);
  const currentPosRef = useRef<Point>({ x: 0, y: 0 });
  const gridRef = useRef<Grid>(createEmptyGrid());
  const statusRef = useRef<GameStatus>('IDLE');
  const levelRef = useRef<number>(1);
  const statsRef = useRef<GameStats>({ score: 0, lines: 0, level: 1, highScore: 0 });
  const isTransitioningRef = useRef<boolean>(false);

  // Keep references updated
  useEffect(() => { currentPieceRef.current = currentPiece; }, [currentPiece]);
  useEffect(() => { currentPosRef.current = currentPos; }, [currentPos]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { levelRef.current = stats.level; }, [stats.level]);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // Load High Score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tetris_high_score');
    if (savedHighScore) {
      setStats((prev) => ({ ...prev, highScore: parseInt(savedHighScore, 10) }));
    }
  }, []);

  // Update High Score helper
  const updateHighScore = useCallback((finalScore: number) => {
    const currentHigh = parseInt(localStorage.getItem('tetris_high_score') || '0', 10);
    if (finalScore > currentHigh) {
      localStorage.setItem('tetris_high_score', finalScore.toString());
      setStats((prev) => ({ ...prev, highScore: finalScore }));
    }
  }, []);

  // Set up screen shake helper
  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 200);
  }, []);

  // Spawns a new piece from the bag
  const spawnPiece = useCallback((
    bag: RandomBagGenerator,
    nextQueue: PieceType[],
    currentGrid: Grid
  ) => {
    const queue = [...nextQueue];
    while (queue.length < 4) {
      queue.push(bag.getNext());
    }

    const type = queue.shift()!;
    setNextPieces(queue);

    const proto = TETROMINOS[type];
    const newPiece: Tetromino = { ...proto };
    
    // Spawn at the top middle
    const startX = Math.floor((BOARD_WIDTH - proto.matrix[0].length) / 2);
    const startY = proto.type === 'I' ? -1 : 0; // standard offset for better spawn position
    const startPos = { x: startX, y: startY };

    // Check game over
    if (checkCollision(newPiece.matrix, startPos, currentGrid)) {
      setStatus('GAME_OVER');
      gameAudio.stopMusic();
      gameAudio.playGameOver();
      updateHighScore(statsRef.current.score);
    } else {
      setCurrentPiece(newPiece);
      setCurrentPos(startPos);
      setHasHeld(false);
    }
  }, [updateHighScore]);

  // Start the game
  const startGame = useCallback(() => {
    gameAudio.resumeContextIfSuspended();
    const bag = new RandomBagGenerator();
    bagGeneratorRef.current = bag;

    const freshGrid = createEmptyGrid();
    setGrid(freshGrid);
    setHoldPiece(null);
    setHasHeld(false);
    setClearingRows([]);

    const initialQueue: PieceType[] = [];
    for (let i = 0; i < 4; i++) {
      initialQueue.push(bag.getNext());
    }

    const savedHighScore = parseInt(localStorage.getItem('tetris_high_score') || '0', 10);
    setStats({
      score: 0,
      lines: 0,
      level: 1,
      highScore: savedHighScore,
    });

    setStatus('PLAYING');
    spawnPiece(bag, initialQueue, freshGrid);
    
    // Play sound and start loop music
    gameAudio.playLevelUp(); // happy start sound
    gameAudio.startMusic();
  }, [spawnPiece]);

  // Pause game toggle
  const togglePause = useCallback(() => {
    if (statusRef.current === 'PLAYING') {
      setStatus('PAUSED');
      gameAudio.stopMusic();
    } else if (statusRef.current === 'PAUSED') {
      setStatus('PLAYING');
      gameAudio.startMusic();
    }
  }, []);

  // Game over overlay clean exit
  const resetToIdle = useCallback(() => {
    setStatus('IDLE');
    setGrid(createEmptyGrid());
    setCurrentPiece(null);
    setHoldPiece(null);
    gameAudio.stopMusic();
  }, []);

  // Lock the current piece onto the grid, check line clears, update scores
  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    const activeGrid = gridRef.current;

    if (!piece) return;

    // Create a copy of the grid
    const nextGrid = activeGrid.map((row) => [...row]);

    // Stamp the piece onto the grid
    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (piece.matrix[r][c] !== 0) {
          const boardY = pos.y + r;
          const boardX = pos.x + c;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            nextGrid[boardY][boardX] = piece.type;
          }
        }
      }
    }

    gameAudio.playLand();

    // Find fully completed rows
    const linesToClear: number[] = [];
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      if (nextGrid[r].every((cell) => cell !== null)) {
        linesToClear.push(r);
      }
    }

    if (linesToClear.length > 0) {
      isTransitioningRef.current = true;
      // Trigger clear flash animation
      setClearingRows(linesToClear);
      
      // Select correct sound effect
      if (linesToClear.length === 4) {
        gameAudio.playTetrisClear();
        triggerShake();
        setScoreNotification('TETRIS! +800');
      } else {
        gameAudio.playLineClear();
        setScoreNotification(`+${linesToClear.length * 100}`);
      }

      // Clear the score notification popup after 1.2 seconds
      setTimeout(() => setScoreNotification(null), 1200);

      // Wait for clear animation (300ms) before physically shifting rows
      setTimeout(() => {
        const clearedGrid = nextGrid.filter((_, idx) => !linesToClear.includes(idx));
        const emptyRowsNeeded = BOARD_HEIGHT - clearedGrid.length;
        const freshRows = Array.from({ length: emptyRowsNeeded }, () => Array(BOARD_WIDTH).fill(null));
        const finalGrid = [...freshRows, ...clearedGrid];

        setGrid(finalGrid);
        setClearingRows([]);

        // Calculate scores
        // 1 line = 100, 2 lines = 300, 3 = 500, 4 = 800
        const scoreTable = [0, 100, 300, 500, 800];
        const rawPoints = scoreTable[linesToClear.length] || 0;
        const earnedPoints = rawPoints * levelRef.current;

        setStats((prev) => {
          const newLines = prev.lines + linesToClear.length;
          // Level up every 10 lines
          const nextLevel = Math.floor(newLines / 10) + 1;
          const finalLevel = Math.max(prev.level, nextLevel);
          const finalScore = prev.score + earnedPoints;
          
          if (finalLevel > prev.level) {
            // Level up sound!
            setTimeout(() => gameAudio.playLevelUp(), 100);
          }

          // Dynamic High score sync
          const currentHigh = prev.highScore;
          const bestScore = Math.max(currentHigh, finalScore);
          if (bestScore > currentHigh) {
            localStorage.setItem('tetris_high_score', bestScore.toString());
          }

          return {
            score: finalScore,
            lines: newLines,
            level: finalLevel,
            highScore: bestScore,
          };
        });

        isTransitioningRef.current = false;
        
        // Spawn next piece
        if (bagGeneratorRef.current) {
          spawnPiece(bagGeneratorRef.current, nextPieces, finalGrid);
        }
      }, 300);

    } else {
      // No lines cleared, spawn immediately
      setGrid(nextGrid);
      if (bagGeneratorRef.current) {
        spawnPiece(bagGeneratorRef.current, nextPieces, nextGrid);
      }
    }
  }, [spawnPiece, nextPieces, triggerShake]);

  // Movement methods
  const moveLeft = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || isTransitioningRef.current) return;
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    const activeGrid = gridRef.current;

    if (piece) {
      const nextPos = { x: pos.x - 1, y: pos.y };
      if (!checkCollision(piece.matrix, nextPos, activeGrid)) {
        setCurrentPos(nextPos);
        gameAudio.playMove();
      }
    }
  }, []);

  const moveRight = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || isTransitioningRef.current) return;
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    const activeGrid = gridRef.current;

    if (piece) {
      const nextPos = { x: pos.x + 1, y: pos.y };
      if (!checkCollision(piece.matrix, nextPos, activeGrid)) {
        setCurrentPos(nextPos);
        gameAudio.playMove();
      }
    }
  }, []);

  const moveDown = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || isTransitioningRef.current) return false;
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    const activeGrid = gridRef.current;

    if (!piece) return false;

    const nextPos = { x: pos.x, y: pos.y + 1 };
    if (!checkCollision(piece.matrix, nextPos, activeGrid)) {
      setCurrentPos(nextPos);
      return true;
    } else {
      lockPiece();
      return false;
    }
  }, [lockPiece]);

  const rotate = useCallback((clockwise = true) => {
    if (statusRef.current !== 'PLAYING' || isTransitioningRef.current) return;
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    const activeGrid = gridRef.current;

    if (!piece) return;

    const nextMatrix = clockwise
      ? rotateMatrix(piece.matrix)
      : rotateMatrixCCW(piece.matrix);

    // Try rotation with SRS kicks
    const kickedPos = attemptRotationKick(nextMatrix, pos, activeGrid);
    if (kickedPos) {
      setCurrentPiece({
        ...piece,
        matrix: nextMatrix,
      });
      setCurrentPos(kickedPos);
      gameAudio.playRotate();
    }
  }, []);

  const hardDrop = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || isTransitioningRef.current) return;
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    const activeGrid = gridRef.current;

    if (!piece) return;

    const targetPos = getGhostPosition(piece.matrix, pos, activeGrid);
    
    // Add extra score points for hard drop height
    const dropDistance = targetPos.y - pos.y;
    if (dropDistance > 0) {
      setStats((prev) => {
        const nextScore = prev.score + dropDistance * 2;
        const currentHigh = prev.highScore;
        const bestScore = Math.max(currentHigh, nextScore);
        if (bestScore > currentHigh) {
          localStorage.setItem('tetris_high_score', bestScore.toString());
        }
        return {
          ...prev,
          score: nextScore,
          highScore: bestScore,
        };
      });
    }

    setCurrentPos(targetPos);
    triggerShake();

    // Lock the piece immediately on the target pos
    // Wait momentarily for satisfying visual weight
    setTimeout(() => {
      lockPiece();
    }, 40);
  }, [lockPiece, triggerShake]);

  const hold = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || hasHeld || isTransitioningRef.current) return;
    const piece = currentPieceRef.current;
    const bag = bagGeneratorRef.current;
    const activeGrid = gridRef.current;

    if (!piece || !bag) return;

    gameAudio.playRotate();
    const currentType = piece.type;
    const nextInHold = holdPiece;

    setHoldPiece(currentType);
    setHasHeld(true);

    if (nextInHold === null) {
      // No piece currently in hold, spawn a fresh next piece
      spawnPiece(bag, nextPieces, activeGrid);
    } else {
      // Swap held piece back into play
      const proto = TETROMINOS[nextInHold];
      const newPiece: Tetromino = { ...proto };
      const startX = Math.floor((BOARD_WIDTH - proto.matrix[0].length) / 2);
      const startY = proto.type === 'I' ? -1 : 0;
      const startPos = { x: startX, y: startY };

      if (checkCollision(newPiece.matrix, startPos, activeGrid)) {
        setStatus('GAME_OVER');
        gameAudio.stopMusic();
        gameAudio.playGameOver();
        updateHighScore(statsRef.current.score);
      } else {
        setCurrentPiece(newPiece);
        setCurrentPos(startPos);
      }
    }
  }, [holdPiece, hasHeld, spawnPiece, nextPieces, updateHighScore]);

  // Calculate gravity step interval in milliseconds
  // Level 1: 900ms, scaling down by ~100ms per level down to ~70ms at Level 9+
  const getGravityInterval = useCallback((level: number) => {
    const speeds = [900, 750, 600, 480, 370, 280, 200, 130, 80, 50];
    return speeds[Math.min(level - 1, speeds.length - 1)];
  }, []);

  // Gravity Game Loop ticker
  useEffect(() => {
    let timerId: any = null;

    if (status === 'PLAYING' && !isTransitioningRef.current) {
      const interval = getGravityInterval(stats.level);
      timerId = setInterval(() => {
        moveDown();
      }, interval);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [status, stats.level, moveDown, getGravityInterval]);

  // Derive ghost piece position
  const ghostPos = currentPiece
    ? getGhostPosition(currentPiece.matrix, currentPos, grid)
    : { x: 0, y: 0 };

  return {
    grid,
    status,
    currentPiece,
    currentPos,
    ghostPos,
    nextPieces,
    holdPiece,
    stats,
    hasHeld,
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
  };
}
export type UseTetrisReturn = ReturnType<typeof useTetris>;
