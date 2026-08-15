import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson, Language, SoundEffectType, UserStats, KeyFingerInfo } from '../types';
import { getKeyInfoForChar } from '../utils/keyboardMap';
import { playKeySound, playErrorSound, playSuccessSound, playCelebrationFanfare } from '../utils/audio';
import { VirtualHands } from './VirtualHands';
import { VirtualKeyboard } from './VirtualKeyboard';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Zap, 
  Star,
  Target,
  Trophy
} from 'lucide-react';

interface TypingArenaProps {
  lesson: Lesson;
  language: Language;
  soundType: SoundEffectType;
  userStats: UserStats;
  onLessonComplete: (result: { lessonId: string; accuracy: number; wpm: number; stars: number; mistakes: Record<string, number> }) => void;
  onNextLesson?: () => void;
  onSelectAnotherLesson?: () => void;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  lesson,
  language,
  soundType,
  userStats,
  onLessonComplete,
  onNextLesson,
  onSelectAnotherLesson,
}) => {
  const isBn = language === 'bn';
  const targetText = lesson.targetText;

  // Typing state
  const [typedInput, setTypedInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [mistakesMap, setMistakesMap] = useState<Record<string, number>>({});
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [isLastKeyError, setIsLastKeyError] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Settings
  const [strictMode, setStrictMode] = useState<boolean>(false);

  // Focus keeper invisible textarea
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Reset when lesson changes
  const resetPractice = useCallback(() => {
    setTypedInput('');
    setStartTime(null);
    setEndTime(null);
    setErrorIndices(new Set());
    setCombo(0);
    setMaxCombo(0);
    setMistakesMap({});
    setLastPressedKey(null);
    setIsLastKeyError(false);
    setIsCompleted(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    resetPractice();
  }, [lesson.id, resetPractice]);

  // Focus input automatically on click / mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const currentIndex = typedInput.length;
  const currentChar = currentIndex < targetText.length ? targetText[currentIndex] : '';
  const currentKeyInfo: KeyFingerInfo | null = currentChar ? getKeyInfoForChar(currentChar) : null;

  // Live Metrics
  const totalTyped = typedInput.length;
  const totalErrors = errorIndices.size;
  const accuracy = totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - totalErrors) / totalTyped) * 100)) : 100;

  // WPM calculation
  const elapsedMinutes = startTime ? ((endTime || Date.now()) - startTime) / 60000 : 0;
  const wordsTyped = totalTyped / 5;
  const liveWpm = elapsedMinutes > 0.02 ? Math.round(wordsTyped / elapsedMinutes) : 0;

  // Handle Keystrokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isCompleted) return;

    // Ignore modifier standalone keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      if (typedInput.length > 0) {
        setTypedInput((prev) => prev.slice(0, -1));
        setLastPressedKey('Backspace');
        setIsLastKeyError(false);
        playKeySound(soundType, false);
      }
      e.preventDefault();
      return;
    }

    if (e.key.length !== 1) return; // Only process single character keys

    e.preventDefault();
    const pressedChar = e.key;
    const expectedChar = targetText[currentIndex];

    // Start timer on first keypress
    if (!startTime) {
      setStartTime(Date.now());
    }

    setLastPressedKey(pressedChar);

    const isMatch = pressedChar === expectedChar;

    if (isMatch) {
      // Correct keystroke
      setIsLastKeyError(false);
      playKeySound(soundType, pressedChar === ' ');
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));

      const newTyped = typedInput + pressedChar;
      setTypedInput(newTyped);

      // Check if finished
      if (newTyped.length === targetText.length) {
        const finishTime = Date.now();
        setEndTime(finishTime);
        setIsCompleted(true);

        const totalMinutes = (finishTime - (startTime || finishTime)) / 60000;
        const finalWpm = totalMinutes > 0 ? Math.round((targetText.length / 5) / totalMinutes) : 30;
        const finalAccuracy = Math.max(0, Math.round(((targetText.length - errorIndices.size) / targetText.length) * 100));

        let stars = 1;
        if (finalAccuracy >= 98 && finalWpm >= (lesson.minWpm || 20)) {
          stars = 3;
        } else if (finalAccuracy >= 94) {
          stars = 2;
        }

        playCelebrationFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        onLessonComplete({
          lessonId: lesson.id,
          accuracy: finalAccuracy,
          wpm: finalWpm,
          stars,
          mistakes: mistakesMap,
        });
      }
    } else {
      // Incorrect keystroke
      setIsLastKeyError(true);
      playErrorSound(soundType);
      setCombo(0);

      // Track weak key mistake
      setMistakesMap((prev) => ({
        ...prev,
        [expectedChar]: (prev[expectedChar] || 0) + 1,
      }));

      // Record error index
      setErrorIndices((prev) => new Set(prev).add(currentIndex));

      if (!strictMode) {
        // If not strict mode, advance with error
        const newTyped = typedInput + pressedChar;
        setTypedInput(newTyped);

        if (newTyped.length === targetText.length) {
          const finishTime = Date.now();
          setEndTime(finishTime);
          setIsCompleted(true);
          const totalMinutes = (finishTime - (startTime || finishTime)) / 60000;
          const finalWpm = totalMinutes > 0 ? Math.round((targetText.length / 5) / totalMinutes) : 20;
          const finalAccuracy = Math.max(0, Math.round(((targetText.length - (errorIndices.size + 1)) / targetText.length) * 100));

          let stars = finalAccuracy >= 95 ? 2 : 1;
          onLessonComplete({
            lessonId: lesson.id,
            accuracy: finalAccuracy,
            wpm: finalWpm,
            stars,
            mistakes: {
              ...mistakesMap,
              [expectedChar]: (mistakesMap[expectedChar] || 0) + 1,
            },
          });
        }
      }
    }
  };

  return (
    <div id="typing-arena-container" className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 py-2">
      {/* Hidden textarea to capture all keystrokes smoothly */}
      <textarea
        ref={inputRef}
        value={typedInput}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="sr-only"
        autoFocus
        aria-label="Typing input area"
      />

      {/* Lesson Header Banner */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isBn ? lesson.titleBn : lesson.titleEn}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {isBn ? `টার্গেট একুরেসি: ${lesson.targetAccuracy}%` : `Target: ${lesson.targetAccuracy}%`}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn ? lesson.descriptionBn : lesson.descriptionEn}
            </p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs sm:text-sm">
          {/* Accuracy % Gauge (Highlighted Primary Metric) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {isBn ? 'নির্ভুলতা' : 'Accuracy'}
            </span>
            <span
              className={`font-black text-base sm:text-xl transition-colors ${
                accuracy >= 98
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : accuracy >= 90
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-amber-500'
              }`}
            >
              {accuracy}%
            </span>
          </div>

          {/* Live WPM */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">WPM</span>
            <span className="font-black text-base sm:text-xl text-slate-700 dark:text-slate-200">
              {liveWpm}
            </span>
          </div>

          {/* Combo / Streak */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
              <Flame className={`w-3 h-3 ${combo > 10 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
              Combo
            </span>
            <span className="font-black text-base sm:text-xl text-amber-500">
              {combo}
            </span>
          </div>

          {/* Reset Button */}
          <button
            id="btn-restart-lesson"
            onClick={resetPractice}
            title={isBn ? 'পুনরায় শুরু করুন' : 'Restart Drill'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Text Display Arena */}
      <div
        id="text-stream-box"
        onClick={() => inputRef.current?.focus()}
        ref={textContainerRef}
        className="w-full min-h-[140px] sm:min-h-[160px] p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 rounded-3xl cursor-text relative shadow-inner flex flex-wrap items-center content-start gap-y-2 select-none overflow-hidden transition-all focus-within:border-emerald-500/80"
      >
        {/* Helper prompt banner when not typing */}
        {!startTime && typedInput.length === 0 && (
          <div className="absolute top-2 right-4 text-[11px] font-sans font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            {isBn ? 'টাইপ করা শুরু করলেই টাইমার চালু হবে' : 'Start typing to begin practice'}
          </div>
        )}

        {/* Render Text stream with letter coloring */}
        <div className="font-mono text-xl sm:text-2xl md:text-3xl tracking-wider leading-relaxed flex flex-wrap items-center">
          {targetText.split('').map((char, index) => {
            const isTyped = index < typedInput.length;
            const isCurrent = index === currentIndex;
            const isError = errorIndices.has(index);

            let charClass = 'text-slate-400 dark:text-slate-500';

            if (isTyped) {
              if (isError) {
                charClass = 'text-rose-600 bg-rose-100 dark:bg-rose-950/80 rounded-xs px-0.5';
              } else {
                charClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
              }
            } else if (isCurrent) {
              charClass = 'text-slate-900 dark:text-white font-black bg-emerald-500/20 dark:bg-emerald-400/30 rounded-xs px-0.5 underline underline-offset-8 decoration-emerald-500 decoration-4 animate-pulse';
            }

            return (
              <span key={index} className={`relative transition-all duration-75 ${charClass}`}>
                {char === ' ' ? (
                  <span className={`inline-block min-w-[0.6em] ${isCurrent ? 'bg-emerald-500/30 rounded-sm' : ''}`}>
                    {isCurrent ? '␣' : ' '}
                  </span>
                ) : (
                  char
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Guidance: Visual Hands */}
      <VirtualHands
        activeFinger={currentKeyInfo ? currentKeyInfo.finger : null}
        targetKeyDisplay={currentChar}
        language={language}
      />

      {/* Guidance: Virtual Keyboard with highlighted active key */}
      <VirtualKeyboard
        targetKeyInfo={currentKeyInfo}
        lastPressedKey={lastPressedKey}
        isErrorKey={isLastKeyError}
      />

      {/* Completion Modal / Overlay */}
      <AnimatePresence>
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
            >
              {/* Header Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {accuracy >= 95
                  ? isBn
                    ? 'চমৎকার! লেসন সম্পন্ন হয়েছে'
                    : 'Brilliant! Lesson Mastered'
                  : isBn
                  ? 'ভালো চেষ্টা! আরেকটু অনুশীলন দরকার'
                  : 'Good Effort! Needs More Accuracy'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
                {isBn
                  ? accuracy >= 95
                    ? 'আপনি সফলভাবে ৯৫%+ একুরেসি অর্জন করেছেন।'
                    : 'পরের লেসন আনলক করতে ন্যূনতম ৯৫% একুরেসি প্রয়োজন।'
                  : accuracy >= 95
                  ? 'You met the 95%+ accuracy threshold!'
                  : 'Target 95%+ accuracy to unlock next milestone.'}
              </p>

              {/* Star Rating Display */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((starIndex) => {
                  const isEarned =
                    (accuracy >= 98 && starIndex <= 3) ||
                    (accuracy >= 94 && starIndex <= 2) ||
                    (accuracy >= 85 && starIndex <= 1);
                  return (
                    <Star
                      key={starIndex}
                      className={`w-8 h-8 ${
                        isEarned
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 font-mono mb-6">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {isBn ? 'একুরেসি' : 'Accuracy'}
                  </div>
                  <div className={`text-lg font-black ${accuracy >= 95 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {isBn ? 'স্পিড' : 'Speed'}
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {liveWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {isBn ? 'পয়েন্ট' : 'XP'}
                  </div>
                  <div className="text-lg font-black text-purple-500">
                    +{lesson.xpReward}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                {accuracy >= 95 && onNextLesson ? (
                  <button
                    id="btn-modal-next-lesson"
                    onClick={() => {
                      setIsCompleted(false);
                      onNextLesson();
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                  >
                    {isBn ? 'পরবর্তী লেসনে যান' : 'Continue to Next Lesson'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  id="btn-modal-retry"
                  onClick={() => {
                    setIsCompleted(false);
                    resetPractice();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isBn ? 'আবার অনুশীলন করুন' : 'Retry This Lesson'}
                </button>

                {onSelectAnotherLesson && (
                  <button
                    id="btn-modal-all-lessons"
                    onClick={onSelectAnotherLesson}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-1"
                  >
                    {isBn ? 'মডিউল তালিকায় ফিরে যান' : 'Back to Lesson Library'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
