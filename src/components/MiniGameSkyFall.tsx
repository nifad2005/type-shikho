import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, SoundEffectType } from '../types';
import { playKeySound, playErrorSound, playSuccessSound, playCelebrationFanfare } from '../utils/audio';
import { speakText } from '../utils/speech';
import { 
  Gamepad2, 
  Heart, 
  Flame, 
  RotateCcw, 
  Play, 
  Trophy, 
  Sparkles,
  ArrowRight,
  Zap,
  Volume2,
  VolumeX,
  Keyboard
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingItem {
  id: number;
  originalText: string;
  remainingText: string;
  x: number; // percentage 10% - 85%
  y: number; // percentage 0% - 100%
  speed: number;
  colorClass: string;
  isWord: boolean;
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

  // Determine difficulty from moduleId if provided
  const derivedDifficulty = moduleId === 'module-1' 
    ? 'home' 
    : moduleId === 'module-2' 
    ? 'top_bottom' 
    : initialDifficulty;

  const [difficulty] = useState<'home' | 'top_bottom' | 'all'>(derivedDifficulty);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('typemaster_skyfall_highscore') || '0', 10);
  });
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [items, setItems] = useState<FallingItem[]>([]);

  // Refs for seamless game loop without closure stales
  const itemsRef = useRef<FallingItem[]>([]);
  const livesRef = useRef<number>(3);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const gameStateRef = useRef<'idle' | 'playing' | 'gameover'>('idle');
  const nextItemIdRef = useRef<number>(1);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const hasReportedGameOverRef = useRef<boolean>(false);
  const onGameCompleteRef = useRef(onGameComplete);

  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
  }, [onGameComplete]);

  // Sync refs with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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

  const COLOR_PALETTES = [
    'bg-teal-600 text-white border-teal-400/50 shadow-teal-500/30',
    'bg-blue-600 text-white border-blue-400/50 shadow-blue-500/30',
    'bg-indigo-600 text-white border-indigo-400/50 shadow-indigo-500/30',
    'bg-violet-600 text-white border-violet-400/50 shadow-violet-500/30',
    'bg-emerald-600 text-white border-emerald-400/50 shadow-emerald-500/30',
    'bg-amber-600 text-white border-amber-400/50 shadow-amber-500/30',
  ];

  const spawnItem = useCallback(() => {
    const pool = getPool();
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const colorClass = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    
    // Base speed in percentage per second
    const baseSpeed = difficulty === 'home' ? 14 : difficulty === 'top_bottom' ? 17 : 20;
    const speed = baseSpeed + Math.random() * 5;

    const newItem: FallingItem = {
      id: nextItemIdRef.current++,
      originalText: chosen,
      remainingText: chosen,
      x: Math.floor(Math.random() * 70) + 15, // between 15% and 85%
      y: 0,
      speed,
      colorClass,
      isWord: chosen.length > 1,
    };

    itemsRef.current = [...itemsRef.current, newItem];
    setItems(itemsRef.current);
  }, [difficulty, getPool]);

  const startGame = () => {
    hasReportedGameOverRef.current = false;
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
        isBn ? 'গেম শুরু হয়েছে! কীবোর্ডে দ্রুত টাইপ করুন।' : 'Game started! Type falling letters swiftly.',
        language,
        voiceEnabled
      );
    }
  };

  // Dedicated Continuous Game Loop using delta time
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
      const deltaSec = Math.min(deltaMs / 1000, 0.1); // cap at 100ms to avoid huge jump on tab switch

      // Check spawn interval (1.4 - 1.8s)
      const spawnInterval = difficulty === 'home' ? 1700 : difficulty === 'top_bottom' ? 1400 : 1200;
      if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = currentTime;
        spawnItem();
      }

      // Move all items downward
      const currentList = itemsRef.current;
      const nextList: FallingItem[] = [];
      let lostLife = false;

      for (let i = 0; i < currentList.length; i++) {
        const item = currentList[i];
        const nextY = item.y + item.speed * deltaSec;

        // Ground threshold (88% height of box)
        if (nextY >= 88) {
          lostLife = true;
          // Item destroyed on impact with laser ground
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
  }, [gameState, difficulty, soundType, spawnItem]);

  // Handle Keystrokes during game
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

      const key = e.key.toLowerCase();
      let matched = false;

      // Find lowest item (highest y) that begins with pressed key
      const currentList = [...itemsRef.current].sort((a, b) => b.y - a.y);
      const targetIndex = currentList.findIndex((it) => it.remainingText.toLowerCase().startsWith(key));

      if (targetIndex !== -1) {
        matched = true;
        const target = currentList[targetIndex];

        if (target.remainingText.length === 1) {
          // Completed item fully!
          playKeySound(soundType);
          const earned = 10 + comboRef.current * 2;
          const newScore = scoreRef.current + earned;
          scoreRef.current = newScore;
          setScore(newScore);

          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('typemaster_skyfall_highscore', newScore.toString());
          }

          const newCombo = comboRef.current + 1;
          comboRef.current = newCombo;
          setCombo(newCombo);
          if (newCombo > maxComboRef.current) {
            maxComboRef.current = newCombo;
            setMaxCombo(newCombo);
          }

          // Remove completed item from list
          itemsRef.current = itemsRef.current.filter((it) => it.id !== target.id);
          setItems(itemsRef.current);
        } else {
          // Partial match on multi-character word
          playKeySound(soundType);
          itemsRef.current = itemsRef.current.map((it) =>
            it.id === target.id
              ? { ...it, remainingText: it.remainingText.slice(1) }
              : it
          );
          setItems(itemsRef.current);
        }
      }

      if (!matched) {
        comboRef.current = 0;
        setCombo(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, highScore, soundType]);

  // When game finishes
  useEffect(() => {
    if (gameState === 'gameover' && !hasReportedGameOverRef.current) {
      hasReportedGameOverRef.current = true;
      const finalScore = scoreRef.current;
      const finalMaxCombo = maxComboRef.current;
      onGameCompleteRef.current(finalScore, finalMaxCombo);

      if (finalScore >= 100) {
        playCelebrationFanfare();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        if (voiceEnabled) {
          speakText(
            isBn ? `চমৎকার! আপনি ${finalScore} স্কোর করে পাস করেছেন!` : `Awesome! You scored ${finalScore} points!`,
            language,
            voiceEnabled
          );
        }
      } else {
        if (voiceEnabled) {
          speakText(
            isBn ? 'আবার চেষ্টা করে অন্তত ১০০ পয়েন্ট স্কোর করুন।' : 'Try again to score at least 100 points.',
            language,
            voiceEnabled
          );
        }
      }
    }
  }, [gameState, voiceEnabled, isBn, language]);

  return (
    <div id="skyfall-game-arena" className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3">
      {/* Clean Minimal Header Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isBn ? 'শব্দ বৃষ্টি রিফ্লেক্স চ্যালেঞ্জ (Sky Fall)' : 'Sky Fall Reflex Challenge'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isBn ? 'না দেখে দ্রুত কীবোর্ডে টাইপ করে অক্ষরগুলো রক্ষা করুন' : 'Touch type falling keys before they hit the ground'}
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
                <Flame className="w-3.5 h-3.5 fill-amber-500 animate-bounce" />
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
        className="relative w-full h-[380px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none"
      >
        {/* Deep Space Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        {/* Laser Ground Defense Line */}
        <div className="absolute bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] uppercase tracking-widest font-mono text-rose-500/70 font-bold">
          {isBn ? 'লেজার প্রতিরক্ষা রেখা' : 'LASER DEFENSE BARRIER'}
        </div>

        {/* IDLE SCREEN */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/90 backdrop-blur-xs">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 border border-teal-500/20 shadow-lg">
              <Zap className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">
              {isBn ? 'রিফ্লেক্স পরীক্ষা করার জন্য প্রস্তুত?' : 'Ready to Test Your Reflexes?'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              {isBn
                ? 'হোম রো পজিশনে হাত রেখে স্ক্রিনে তাকিয়ে দ্রুত টাইপ করুন। অক্ষরগুলো লেজার রেখায় পড়ার আগেই ধ্বংস করুন।'
                : 'Keep your fingers on the home keys. Type falling letters swiftly before they touch the laser line.'}
            </p>

            <button
              id="btn-start-skyfall"
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isBn ? 'গেম শুরু করুন (Start)' : 'Start Game'}</span>
            </button>
          </div>
        )}

        {/* ACTIVE FALLING ITEMS */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {items.map((item) => {
              const firstChar = item.remainingText.charAt(0);
              const restChars = item.remainingText.slice(1);

              return (
                <div
                  key={item.id}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-2xl font-mono text-sm sm:text-base font-black shadow-lg flex items-center gap-0.5 border ${item.colorClass} transition-transform`}
                >
                  {/* Glowing Next Target Character */}
                  <span className="text-amber-300 underline underline-offset-4 decoration-2 decoration-amber-300 font-extrabold animate-pulse">
                    {firstChar}
                  </span>
                  {restChars && <span className="opacity-90">{restChars}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/90 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/20 shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">
              {score >= 100 
                ? (isBn ? 'চ্যালেঞ্জ সম্পন্ন!' : 'Challenge Passed!') 
                : (isBn ? 'গেম শেষ!' : 'Game Over!')}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              {score >= 100
                ? (isBn ? 'অসাধারণ! আপনার আঙুলের গতি ও নিয়ন্ত্রণ দারুণ ছিল।' : 'Great reflex and finger discipline!')
                : (isBn ? 'আবার চেষ্টা করে ১০০+ পয়েন্ট স্কোর করুন।' : 'Try again to score 100+ points.')}
            </p>

            <div className="flex items-center gap-6 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 font-mono text-center">
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
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBn ? 'আবার খেলুন' : 'Play Again'}</span>
              </button>

              {onNextLesson && (
                <button
                  id="btn-next-after-skyfall"
                  onClick={onNextLesson}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
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
