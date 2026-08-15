import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, SoundEffectType } from '../types';
import { playKeySound, playErrorSound, playCelebrationFanfare, playSuccessSound } from '../utils/audio';
import { speakText } from '../utils/speech';
import { 
  Gamepad2, 
  Heart, 
  Flame, 
  RotateCcw, 
  Play, 
  Trophy, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingItem {
  id: number;
  originalText: string;
  remainingText: string;
  x: number; // percentage 15% - 85%
  y: number; // percentage 0% - 90%
  speed: number;
}

interface MiniGameSkyFallProps {
  language: Language;
  soundType: SoundEffectType;
  voiceEnabled?: boolean;
  initialDifficulty?: 'home' | 'top_bottom' | 'all';
  moduleId?: string;
  onGameComplete: (score: number, maxCombo: number) => void;
  onNextLesson?: () => void;
}

export const MiniGameSkyFall: React.FC<MiniGameSkyFallProps> = ({
  language,
  soundType,
  voiceEnabled = true,
  initialDifficulty = 'home',
  moduleId,
  onGameComplete,
  onNextLesson,
}) => {
  const isBn = language === 'bn';

  const TARGET_GOAL = 20; // 20 letters to win the challenge

  // Difficulty pool
  const derivedDifficulty = moduleId === 'module-1' 
    ? 'home' 
    : moduleId === 'module-2' 
    ? 'top_bottom' 
    : initialDifficulty;

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'victory' | 'gameover'>('idle');
  const [clearedCount, setClearedCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [items, setItems] = useState<FallingItem[]>([]);

  // Refs for smooth 60fps loop
  const itemsRef = useRef<FallingItem[]>([]);
  const livesRef = useRef<number>(3);
  const clearedCountRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const gameStateRef = useRef<'idle' | 'playing' | 'victory' | 'gameover'>('idle');
  const nextItemIdRef = useRef<number>(1);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const getPool = useCallback(() => {
    if (derivedDifficulty === 'home' || moduleId === 'module-1') {
      return ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'];
    }
    if (derivedDifficulty === 'top_bottom' || moduleId === 'module-2') {
      return ['e', 'r', 'u', 'i', 'c', 'v', 'm', 'n', 't', 'y', 'w', 'o'];
    }
    return ['f', 'j', 'd', 'k', 's', 'l', 'a', 'e', 'r', 'u', 'i', 't', 'y', 'c', 'v', 'b', 'n', 'm'];
  }, [derivedDifficulty, moduleId]);

  const spawnItem = useCallback(() => {
    const pool = getPool();
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    
    // Smooth readable speed (12% to 16% height per second)
    const baseSpeed = derivedDifficulty === 'home' ? 14 : 17;
    const speed = baseSpeed + Math.random() * 3;

    const newItem: FallingItem = {
      id: nextItemIdRef.current++,
      originalText: chosen,
      remainingText: chosen,
      x: Math.floor(Math.random() * 65) + 18, // 18% to 83% width
      y: 2,
      speed,
    };

    itemsRef.current = [...itemsRef.current, newItem];
    setItems(itemsRef.current);
  }, [derivedDifficulty, getPool]);

  const startGame = () => {
    setClearedCount(0);
    clearedCountRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    setCombo(0);
    comboRef.current = 0;
    setMaxCombo(0);
    maxComboRef.current = 0;
    setItems([]);
    itemsRef.current = [];
    
    setGameState('playing');
    gameStateRef.current = 'playing';
    
    lastSpawnTimeRef.current = performance.now();
    lastFrameTimeRef.current = performance.now();

    if (voiceEnabled) {
      speakText(
        isBn ? 'গেম শুরু হয়েছে! কিগুলো মাটিতে পড়ার আগেই টাইপ করুন।' : 'Game started! Type falling keys before they touch the line.',
        language,
        voiceEnabled
      );
    }
  };

  // Continuous Game Loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    let isRunning = true;
    lastFrameTimeRef.current = performance.now();
    lastSpawnTimeRef.current = performance.now();

    const gameLoop = (currentTime: number) => {
      if (!isRunning || gameStateRef.current !== 'playing') return;

      const deltaMs = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;
      const deltaSec = Math.min(deltaMs / 1000, 0.1);

      // Spawn rate: Every 1.6s
      if (currentTime - lastSpawnTimeRef.current > 1600) {
        lastSpawnTimeRef.current = currentTime;
        spawnItem();
      }

      // Move items down
      const currentList = itemsRef.current;
      const nextList: FallingItem[] = [];
      let lostLife = false;

      for (let i = 0; i < currentList.length; i++) {
        const item = currentList[i];
        const nextY = item.y + item.speed * deltaSec;

        // Bottom threshold (85%)
        if (nextY >= 85) {
          lostLife = true;
        } else {
          nextList.push({
            ...item,
            y: nextY,
          });
        }
      }

      itemsRef.current = nextList;
      setItems(nextList);

      if (lostLife) {
        playErrorSound(soundType);
        comboRef.current = 0;
        setCombo(0);

        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);

        if (newLives <= 0) {
          gameStateRef.current = 'gameover';
          setGameState('gameover');
          isRunning = false;
          onGameComplete(scoreRef.current, maxComboRef.current);
          return;
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [gameState, soundType, spawnItem, onGameComplete]);

  // Keystroke handler
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

      const key = e.key.toLowerCase();
      
      // Match lowest falling item
      const currentList = [...itemsRef.current].sort((a, b) => b.y - a.y);
      const targetIndex = currentList.findIndex((it) => it.remainingText.toLowerCase().startsWith(key));

      if (targetIndex !== -1) {
        const target = currentList[targetIndex];
        playKeySound(soundType);

        // Success pop
        const newScore = scoreRef.current + 10 + comboRef.current * 2;
        scoreRef.current = newScore;
        setScore(newScore);

        const newCleared = clearedCountRef.current + 1;
        clearedCountRef.current = newCleared;
        setClearedCount(newCleared);

        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        if (newCombo > maxComboRef.current) {
          maxComboRef.current = newCombo;
          setMaxCombo(newCombo);
        }

        // Remove cleared item
        itemsRef.current = itemsRef.current.filter((it) => it.id !== target.id);
        setItems(itemsRef.current);

        // Check Victory Goal (20 letters)
        if (newCleared >= TARGET_GOAL) {
          gameStateRef.current = 'victory';
          setGameState('victory');
          playCelebrationFanfare();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          onGameComplete(newScore, maxComboRef.current);
          if (voiceEnabled) {
            speakText(
              isBn ? 'অভিনন্দন! আপনি সফলভাবে চ্যালেঞ্জ সম্পন্ন করেছেন।' : 'Congratulations! You completed the challenge.',
              language,
              voiceEnabled
            );
          }
        }
      } else {
        // Wrong key
        playErrorSound(soundType);
        comboRef.current = 0;
        setCombo(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, soundType, onGameComplete, voiceEnabled, isBn, language]);

  return (
    <div id="skyfall-game-arena" className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* Top Minimal Status Header */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono select-none">
        {/* Left: Hearts */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((h) => (
            <Heart
              key={h}
              className={`w-4 h-4 transition-transform ${
                h <= lives
                  ? 'text-rose-500 fill-rose-500 scale-100'
                  : 'text-slate-700 fill-transparent scale-90 opacity-40'
              }`}
            />
          ))}
        </div>

        {/* Center: Goal Progress */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Target className="w-3.5 h-3.5 text-teal-400" />
          <span>
            {isBn ? 'লক্ষ্য:' : 'Goal:'} <strong className="text-teal-400 font-bold">{clearedCount}</strong> / {TARGET_GOAL}
          </span>
        </div>

        {/* Right: Score & Streak */}
        <div className="flex items-center gap-3">
          {combo > 2 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400 animate-bounce" />
              <span>{combo}x</span>
            </div>
          )}
          <span className="text-slate-400">
            {isBn ? 'স্কোর:' : 'Score:'} <strong className="text-white">{score}</strong>
          </span>
        </div>
      </div>

      {/* Main Clean Game Arena Stage */}
      <div className="relative w-full h-[360px] bg-slate-950 border border-slate-800/90 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between select-none">
        {/* Subtle Background Dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

        {/* Laser Ground Threshold */}
        <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] tracking-widest font-mono text-rose-500/60 font-semibold uppercase">
          {isBn ? 'মাটিতে পড়ার আগেই চাপুন' : 'HIT BEFORE GROUND'}
        </div>

        {/* 1. IDLE / HOW TO PLAY SCREEN */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/95 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 border border-teal-500/20">
              <Gamepad2 className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-white mb-1">
              {isBn ? 'রিফ্লেক্স চ্যালেঞ্জ (Reflex Challenge)' : 'Reflex Challenge'}
            </h4>
            <p className="text-xs text-teal-400/90 font-medium mb-4">
              {isBn ? `লক্ষ্য: ২০টি কী সফলভাবে টাইপ করুন` : `Target: Type 20 falling keys accurately`}
            </p>

            {/* 3 Simple Minimal Rules */}
            <div className="grid grid-cols-3 gap-2 max-w-md w-full mb-5 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px]">১</span>
                <span>{isBn ? 'কী উপর থেকে নিচে নামবে' : 'Keys fall down'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px]">২</span>
                <span>{isBn ? 'কীবোর্ডে সেই কী চাপুন' : 'Strike that key'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">৩</span>
                <span>{isBn ? '৩টি জীবন থাকবে' : '3 Lives allowed'}</span>
              </div>
            </div>

            <button
              id="btn-start-skyfall"
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isBn ? 'শুরু করুন (Start Game)' : 'Start Game'}</span>
            </button>
          </div>
        )}

        {/* 2. ACTIVE FALLING TILES */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl font-mono text-xl font-bold flex items-center justify-center bg-slate-900 border-2 border-teal-400 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-transform"
              >
                {item.originalText.toUpperCase()}
              </div>
            ))}
          </div>
        )}

        {/* 3. VICTORY SCREEN */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/95 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2 border border-teal-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-xl font-bold text-white mb-1">
              {isBn ? 'চমৎকার! আপনি বিজয়ী!' : 'Challenge Passed!'}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              {isBn ? `আপনি সফলভাবে ২০টি কী টাইপ করে ${score} পয়েন্ট পেয়েছেন।` : `You cleared 20 keys with a score of ${score}.`}
            </p>

            <div className="flex items-center gap-3">
              <button
                id="btn-retry-skyfall"
                onClick={startGame}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBn ? 'আবার খেলুন' : 'Play Again'}</span>
              </button>

              {onNextLesson && (
                <button
                  id="btn-next-after-skyfall"
                  onClick={onNextLesson}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  <span>{isBn ? 'পরবর্তী লেসন' : 'Next Lesson'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/95 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h4 className="text-xl font-bold text-white mb-1">
              {isBn ? 'গেম শেষ!' : 'Game Over!'}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              {isBn ? `৩টি মিস হয়েছে। আপনি ${clearedCount}টি কী সম্পন্ন করেছিলেন।` : `3 keys reached the ground. You cleared ${clearedCount} keys.`}
            </p>

            <button
              id="btn-retry-skyfall"
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isBn ? 'আবার চেষ্টা করুন' : 'Try Again'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
