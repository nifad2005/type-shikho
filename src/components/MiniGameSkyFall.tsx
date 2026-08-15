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
  Trophy, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingItem {
  id: number;
  text: string;
  x: number; // percentage 10% - 90%
  y: number; // percentage 0% - 100%
  speed: number;
  color: string;
}

interface MiniGameSkyFallProps {
  language: Language;
  soundType: SoundEffectType;
  initialDifficulty?: 'home' | 'top_bottom' | 'all';
  moduleId?: string;
  onGameComplete: (score: number, maxCombo: number) => void;
  onNextLesson?: () => void;
}

export const MiniGameSkyFall: React.FC<MiniGameSkyFallProps> = ({
  language,
  soundType,
  initialDifficulty = 'home',
  moduleId,
  onGameComplete,
  onNextLesson,
}) => {
  const isBn = language === 'bn';

  // Determine difficulty from moduleId if provided
  const derivedDifficulty = moduleId === 'module-1' 
    ? 'home' 
    : moduleId === 'module-2' 
    ? 'top_bottom' 
    : initialDifficulty;

  const [difficulty, setDifficulty] = useState<'home' | 'top_bottom' | 'all'>(derivedDifficulty);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('typemaster_skyfall_highscore') || '0', 10);
  });
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [items, setItems] = useState<FallingItem[]>([]);

  const nextItemIdRef = useRef<number>(1);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pool of characters/words according to difficulty / module
  const getPool = useCallback(() => {
    if (difficulty === 'home' || moduleId === 'module-1') {
      return ['f', 'j', 'd', 'k', 's', 'l', 'a', ';', 'all', 'fall', 'glad', 'flask', 'ask', 'dad', 'salad', 'lads'];
    }
    if (difficulty === 'top_bottom' || moduleId === 'module-2') {
      return ['e', 'r', 'u', 'i', 'c', 'v', 'm', 'n', 't', 'y', 'w', 'o', 'tree', 'user', 'city', 'main', 'view', 'red', 'rust', 'blue'];
    }
    return ['speed', 'focus', 'power', 'rhythm', 'master', 'touch', 'smooth', 'zen', 'clean', 'quick', 'glow', 'brave'];
  }, [difficulty, moduleId]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setItems([]);
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

      // Spawn interval
      const spawnInterval = difficulty === 'home' ? 1700 : difficulty === 'top_bottom' ? 1400 : 1200;
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        const pool = getPool();
        const randomText = pool[Math.floor(Math.random() * pool.length)];
        const colors = [
          'bg-teal-500 text-white',
          'bg-blue-500 text-white',
          'bg-indigo-500 text-white',
          'bg-amber-500 text-white',
          'bg-emerald-500 text-white',
          'bg-violet-500 text-white',
        ];

        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          text: randomText,
          x: Math.floor(Math.random() * 70) + 15, // between 15% and 85%
          y: 0,
          speed: (difficulty === 'home' ? 0.38 : difficulty === 'top_bottom' ? 0.48 : 0.6) + Math.random() * 0.12,
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
          if (nextY >= 92) {
            // Hit ground
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

      // Find matching item with lowest y (closest to laser barrier)
      setItems((prev) => {
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

            return prev.filter((it) => it.id !== target.id);
          } else {
            // Multi-char word: pop first letter
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

  // When game finishes
  useEffect(() => {
    if (gameState === 'gameover') {
      onGameComplete(score, maxCombo);
      if (score >= 100) {
        playCelebrationFanfare();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    }
  }, [gameState, score, maxCombo, onGameComplete]);

  return (
    <div id="skyfall-game-arena" className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4">
      {/* Clean Minimal Header Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isBn ? 'শব্দ বৃষ্টি রিফ্লেক্স চ্যালেঞ্জ' : 'Sky Fall Reflex Challenge'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isBn ? 'অক্ষরগুলো নিচে পড়ার আগেই কিবোর্ডে চাপুন' : 'Type falling letters before they reach the ground'}
            </p>
          </div>
        </div>

        {/* Live In-Game HUD */}
        {gameState === 'playing' ? (
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Lives */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 ${
                    heart <= lives
                      ? 'text-rose-500 fill-rose-500 animate-pulse'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Score */}
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold">{isBn ? 'স্কোর' : 'Score'}:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">{score}</span>
            </div>

            {/* Streak */}
            {combo > 2 && (
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{combo}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium">
            {highScore > 0 && `${isBn ? 'সর্বোচ্চ স্কোর' : 'High Score'}: ${highScore}`}
          </div>
        )}
      </div>

      {/* Main Game Stage */}
      <div
        ref={containerRef}
        className="relative w-full h-[380px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between select-none"
      >
        {/* Soft Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Ground Laser Barrier */}
        <div className="absolute bottom-5 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_8px_rgba(244,63,94,0.6)]" />

        {/* IDLE SCREEN */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 border border-teal-500/20">
              <Zap className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">
              {isBn ? 'রিফ্লেক্স পরীক্ষা করার জন্য প্রস্তুত?' : 'Ready to Test Your Reflexes?'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              {isBn
                ? 'না দেখে আঙুলের পজিশন ঠিক রেখে দ্রুত টাইপ করে অক্ষরগুলো ধ্বংস করুন।'
                : 'Keep your hands on the home position and destroy falling letters before they land.'}
            </p>

            <button
              id="btn-start-skyfall"
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {isBn ? 'শুরু করুন (Start)' : 'Start Game'}
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
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full font-mono text-sm font-bold shadow-md flex items-center gap-1 border border-white/20 transition-all ${item.color}`}
              >
                <span className="tracking-wide">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/80 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">
              {score >= 100 
                ? (isBn ? 'চ্যালেঞ্জ সম্পন্ন!' : 'Challenge Passed!') 
                : (isBn ? 'গেম শেষ!' : 'Game Over!')}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              {score >= 100
                ? (isBn ? 'অসাধারণ! আপনার আঙুলের নিয়ন্ত্রণ দারুণ ছিল।' : 'Great reflex and finger discipline!')
                : (isBn ? 'আবার চেষ্টা করে ১০০+ পয়েন্ট স্কোর করুন।' : 'Try again to score 100+ points.')}
            </p>

            <div className="flex items-center gap-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl mb-6 font-mono text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBn ? 'স্কোর' : 'Score'}</div>
                <div className="text-lg font-bold text-teal-400">{score}</div>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBn ? 'সর্বোচ্চ স্ট্রিক' : 'Max Streak'}</div>
                <div className="text-lg font-bold text-amber-400">{maxCombo}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-retry-skyfall"
                onClick={startGame}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isBn ? 'আবার খেলুন' : 'Play Again'}
              </button>

              {onNextLesson && (
                <button
                  id="btn-next-after-skyfall"
                  onClick={onNextLesson}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                >
                  <span>{isBn ? 'পরবর্তী লেসন' : 'Next Lesson'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
