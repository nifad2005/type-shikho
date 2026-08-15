import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, SoundEffectType } from '../types';
import { playKeySound, playErrorSound, playSuccessSound, playCelebrationFanfare } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Heart, 
  Flame, 
  RotateCcw, 
  Play, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  Zap,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingItem {
  id: number;
  text: string;
  x: number; // percentage 10% - 90%
  y: number; // percentage 0% - 100%
  speed: number;
  color: string;
  fingerHint?: string;
}

interface MiniGameSkyFallProps {
  language: Language;
  soundType: SoundEffectType;
  onGameComplete: (score: number, maxCombo: number) => void;
}

export const MiniGameSkyFall: React.FC<MiniGameSkyFallProps> = ({
  language,
  soundType,
  onGameComplete,
}) => {
  const isBn = language === 'bn';

  // Game Mode
  const [difficulty, setDifficulty] = useState<'home' | 'top_bottom' | 'all'>('home');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('typemaster_skyfall_highscore') || '0', 10);
  });
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [typedBuffer, setTypedBuffer] = useState<string>('');

  const nextItemIdRef = useRef<number>(1);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pool of characters/words according to difficulty
  const getPool = useCallback(() => {
    if (difficulty === 'home') {
      return ['f', 'j', 'd', 'k', 's', 'l', 'a', 'all', 'fall', 'glad', 'flask', 'ask', 'dad'];
    }
    if (difficulty === 'top_bottom') {
      return ['e', 'r', 'u', 'i', 'c', 'v', 'm', 'n', 'tree', 'user', 'city', 'main', 'view', 'red'];
    }
    return ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'star', 'fire', 'glow', 'wave', 'cyber', 'master'];
  }, [difficulty]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setItems([]);
    setTypedBuffer('');
    setGameState('playing');
    lastSpawnRef.current = Date.now();
  };

  // Main animation frame game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    let isSubscribed = true;

    const loop = () => {
      if (!isSubscribed) return;
      const now = Date.now();

      // Spawn new items every 1.4 - 2.2 seconds based on difficulty
      const spawnInterval = difficulty === 'home' ? 1800 : difficulty === 'top_bottom' ? 1500 : 1200;
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        const pool = getPool();
        const randomText = pool[Math.floor(Math.random() * pool.length)];
        const colors = [
          'bg-emerald-500 text-white',
          'bg-cyan-500 text-white',
          'bg-purple-500 text-white',
          'bg-amber-500 text-white',
          'bg-rose-500 text-white',
          'bg-blue-500 text-white',
        ];

        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          text: randomText,
          x: Math.floor(Math.random() * 70) + 15, // between 15% and 85%
          y: 0,
          speed: (difficulty === 'home' ? 0.35 : difficulty === 'top_bottom' ? 0.45 : 0.6) + Math.random() * 0.15,
          color: colors[Math.floor(Math.random() * colors.length)],
        };

        setItems((prev) => [...prev, newItem]);
      }

      // Update positions
      setItems((prevItems) => {
        const nextItems: FallingItem[] = [];
        let lostLife = false;

        for (const item of prevItems) {
          const nextY = item.y + item.speed;
          if (nextY >= 95) {
            // Hit ground!
            lostLife = true;
          } else {
            nextItems.push({ ...item, y: nextY });
          }
        }

        if (lostLife) {
          playErrorSound(soundType);
          setCombo(0);
          setLives((l) => {
            const updated = l - 1;
            if (updated <= 0) {
              setGameState('gameover');
            }
            return Math.max(0, updated);
          });
        }

        return nextItems;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      isSubscribed = false;
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, difficulty, getPool, soundType]);

  // Handle Keystrokes during game
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

      const key = e.key.toLowerCase();
      let matched = false;

      // Find the lowest falling item that matches key
      setItems((prev) => {
        // Find matching item with lowest y (closest to ground)
        const sorted = [...prev].sort((a, b) => b.y - a.y);
        const matchIndex = sorted.findIndex((item) => item.text.toLowerCase().startsWith(key));

        if (matchIndex !== -1) {
          matched = true;
          const target = sorted[matchIndex];

          if (target.text.length === 1) {
            // Completed item!
            playKeySound(soundType);
            const pointsEarned = 10 + combo * 2;
            setScore((s) => {
              const newScore = s + pointsEarned;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('typemaster_skyfall_highscore', newScore.toString());
              }
              return newScore;
            });
            setCombo((c) => {
              const newC = c + 1;
              setMaxCombo((mc) => Math.max(mc, newC));
              return newC;
            });

            // Return filtered
            return prev.filter((it) => it.id !== target.id);
          } else {
            // Multi-char word: slice first letter
            playKeySound(soundType);
            return prev.map((it) =>
              it.id === target.id
                ? { ...it, text: it.text.slice(1) }
                : it
            );
          }
        }
        return prev;
      });

      if (!matched) {
        setCombo(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, combo, highScore, soundType]);

  // When game over
  useEffect(() => {
    if (gameState === 'gameover') {
      onGameComplete(score, maxCombo);
      if (score > 300) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
    }
  }, [gameState, score, maxCombo, onGameComplete]);

  return (
    <div id="skyfall-game-arena" className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
      {/* Game Dashboard Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isBn ? 'শব্দ বৃষ্টি (Sky Fall) মিনি গেম' : 'Sky Fall Typing Game'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn ? 'উপর থেকে পড়া অক্ষরগুলো মাটিতে পড়ার আগেই টাইপ করুন' : 'Type falling letters before they hit the ground'}
            </p>
          </div>
        </div>

        {/* Difficulty Selector */}
        {gameState === 'idle' && (
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['home', 'top_bottom', 'all'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDifficulty(mode)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  difficulty === mode
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {mode === 'home'
                  ? isBn
                    ? 'হোম রো'
                    : 'Home Row'
                  : mode === 'top_bottom'
                  ? isBn
                    ? 'টপ ও বটম'
                    : 'Top & Bottom'
                  : isBn
                  ? 'সব অক্ষর'
                  : 'Full Keyboard'}
              </button>
            ))}
          </div>
        )}

        {/* Live Score & Lives */}
        {gameState === 'playing' && (
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-sm">
            {/* Lives */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-5 h-5 ${
                    heart <= lives
                      ? 'text-rose-500 fill-rose-500 animate-pulse'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold">
                {isBn ? 'স্কোর' : 'Score'}
              </span>
              <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                {score}
              </span>
            </div>

            {/* Combo */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-0.5">
                <Flame className={`w-3 h-3 ${combo > 5 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
                Streak
              </span>
              <span className="text-lg font-black text-amber-500">
                {combo}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Game Stage Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[400px] sm:h-[460px] bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/80 border-2 border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none"
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Danger Ground Line */}
        <div className="absolute bottom-6 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.8)]" />

        {/* IDLE SCREEN */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/30">
              <Gamepad2 className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isBn ? 'শব্দ বৃষ্টি রিফ্লেক্স চ্যালেঞ্জ' : 'Sky Fall Typing Reflex'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2 mb-6">
              {isBn
                ? 'উপর থেকে পড়তে থাকা অক্ষরগুলো ফিজিক্যাল কিবোর্ড থেকে না দেখে টাইপ করে ধ্বংস করুন!'
                : 'Destroy falling bubbles before they hit the laser ground barrier!'}
            </p>

            <button
              id="btn-start-skyfall"
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base flex items-center gap-2 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/30 transition-all active:scale-95 animate-pulse cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              {isBn ? 'গেম শুরু করুন' : 'Start Game'}
            </button>
          </div>
        )}

        {/* ACTIVE FALLING ITEMS */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full font-mono text-sm sm:text-base font-black shadow-lg flex items-center gap-1 border border-white/30 transition-all ${item.color} animate-fade-in`}
              >
                <span className="tracking-wider">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/85 backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isBn ? 'গেম ওভার!' : 'Game Over!'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              {isBn ? 'দারুণ খেলেছেন! আপনার আঙুলের রিফ্লেক্স চমৎকার ছিল।' : 'Great effort training your reflex speed!'}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono mb-6 w-full max-w-xs">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  {isBn ? 'চূড়ান্ত স্কোর' : 'Final Score'}
                </div>
                <div className="text-xl font-black text-purple-400">{score}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  {isBn ? 'সর্বোচ্চ স্ট্রিক' : 'Max Streak'}
                </div>
                <div className="text-xl font-black text-amber-400">{maxCombo}</div>
              </div>
            </div>

            <button
              id="btn-retry-skyfall"
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {isBn ? 'আবার খেলুন' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
