import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson, Language, SoundEffectType, UserStats, KeyFingerInfo } from '../types';
import { getKeyInfoForChar } from '../utils/keyboardMap';
import { playKeySound, playErrorSound, playCelebrationFanfare } from '../utils/audio';
import { VirtualHands } from './VirtualHands';
import { VirtualKeyboard } from './VirtualKeyboard';
import { MiniGameSkyFall } from './MiniGameSkyFall';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  Star,
  Target,
  Trophy,
  CheckCircle2,
  Gamepad2
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

  // If this is a Game Checkpoint Lesson
  if (lesson.type === 'game') {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4 py-2">
        <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {isBn ? lesson.titleBn : lesson.titleEn}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? lesson.descriptionBn : lesson.descriptionEn}
              </p>
            </div>
          </div>
          {onSelectAnotherLesson && (
            <button
              onClick={onSelectAnotherLesson}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              {isBn ? 'অন্য লেসন' : 'All Lessons'}
            </button>
          )}
        </div>

        <MiniGameSkyFall
          language={language}
          soundType={soundType}
          moduleId={lesson.moduleId}
          onGameComplete={(score, maxCombo) => {
            const stars = score >= 200 ? 3 : score >= 100 ? 2 : 1;
            onLessonComplete({
              lessonId: lesson.id,
              accuracy: 95,
              wpm: Math.min(60, Math.floor(score / 8)),
              stars,
              mistakes: {},
            });
          }}
          onNextLesson={onNextLesson}
        />
      </div>
    );
  }

  // Standard Guided Typing Lesson
  const targetText = lesson.targetText;

  // Typing state
  const [typedInput, setTypedInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [combo, setCombo] = useState<number>(0);
  const [mistakesMap, setMistakesMap] = useState<Record<string, number>>({});
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [isLastKeyError, setIsLastKeyError] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Hidden focus textarea
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Reset function
  const resetPractice = useCallback(() => {
    setTypedInput('');
    setStartTime(null);
    setEndTime(null);
    setErrorIndices(new Set());
    setCombo(0);
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

  // Keep focus on input
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

  // Global Keyboard Shortcuts (Esc to restart, Enter on complete to continue)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resetPractice();
      }
      if (e.key === 'Enter' && isCompleted && onNextLesson) {
        e.preventDefault();
        setIsCompleted(false);
        onNextLesson();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isCompleted, onNextLesson, resetPractice]);

  // Handle Keystrokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isCompleted) return;

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

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

    if (e.key.length !== 1) return;

    e.preventDefault();
    const pressedChar = e.key;
    const expectedChar = targetText[currentIndex];

    if (!startTime) {
      setStartTime(Date.now());
    }

    setLastPressedKey(pressedChar);

    const isMatch = pressedChar === expectedChar;

    if (isMatch) {
      setIsLastKeyError(false);
      playKeySound(soundType, pressedChar === ' ');
      setCombo((c) => c + 1);

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
        if (finalAccuracy >= 98) {
          stars = 3;
        } else if (finalAccuracy >= 94) {
          stars = 2;
        }

        playCelebrationFanfare();
        confetti({
          particleCount: 70,
          spread: 60,
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
      // Mistake
      setIsLastKeyError(true);
      playErrorSound(soundType);
      setCombo(0);

      setMistakesMap((prev) => ({
        ...prev,
        [expectedChar]: (prev[expectedChar] || 0) + 1,
      }));

      setErrorIndices((prev) => new Set(prev).add(currentIndex));

      // Advance with mistake recorded
      const newTyped = typedInput + pressedChar;
      setTypedInput(newTyped);

      if (newTyped.length === targetText.length) {
        const finishTime = Date.now();
        setEndTime(finishTime);
        setIsCompleted(true);
        const totalMinutes = (finishTime - (startTime || finishTime)) / 60000;
        const finalWpm = totalMinutes > 0 ? Math.round((targetText.length / 5) / totalMinutes) : 20;
        const finalAccuracy = Math.max(0, Math.round(((targetText.length - (errorIndices.size + 1)) / targetText.length) * 100));

        const stars = finalAccuracy >= 95 ? 2 : 1;
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
  };

  return (
    <div id="typing-arena-container" className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3">
      {/* Hidden textarea to capture keystrokes smoothly */}
      <textarea
        ref={inputRef}
        value={typedInput}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="sr-only"
        autoFocus
        aria-label="Typing input area"
      />

      {/* Clean Minimal Header Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isBn ? lesson.titleBn : lesson.titleEn}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn ? lesson.descriptionBn : lesson.descriptionEn}
            </p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs sm:text-sm">
          {/* Accuracy */}
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              {isBn ? 'একুরেসি' : 'Acc'}:
            </span>
            <span
              className={`font-black text-sm sm:text-base ${
                accuracy >= 95 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-500'
              }`}
            >
              {accuracy}%
            </span>
          </div>

          {/* WPM */}
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">WPM:</span>
            <span className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-200">
              {liveWpm}
            </span>
          </div>

          {/* Restart Button */}
          <button
            id="btn-restart-lesson"
            onClick={resetPractice}
            title={isBn ? 'পুনরায় শুরু (Esc)' : 'Restart (Esc)'}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Text Display Arena */}
      <div
        id="text-stream-box"
        onClick={() => inputRef.current?.focus()}
        ref={textContainerRef}
        className="w-full min-h-[120px] sm:min-h-[140px] px-6 py-5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-text relative flex flex-wrap items-center content-center select-none overflow-hidden transition-all focus-within:border-teal-500"
      >
        {/* Subtle Start Prompt */}
        {!startTime && typedInput.length === 0 && (
          <div className="absolute top-2 right-3 text-[10px] text-teal-600 dark:text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{isBn ? 'টাইপ শুরু করুন' : 'Start typing'}</span>
          </div>
        )}

        {/* Text Stream */}
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
                charClass = 'text-teal-600 dark:text-teal-400 font-semibold';
              }
            } else if (isCurrent) {
              charClass = 'text-slate-900 dark:text-white font-black bg-teal-500/20 dark:bg-teal-400/30 rounded-xs px-0.5 underline underline-offset-8 decoration-teal-500 decoration-4 animate-pulse';
            }

            return (
              <span key={index} className={`relative transition-all duration-75 ${charClass}`}>
                {char === ' ' ? (
                  <span className={`inline-block min-w-[0.6em] ${isCurrent ? 'bg-teal-500/30 rounded-sm' : ''}`}>
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

      {/* Visual Hands Guide */}
      <VirtualHands
        activeFinger={currentKeyInfo ? currentKeyInfo.finger : null}
        targetKeyDisplay={currentChar}
        language={language}
      />

      {/* Virtual Keyboard Guide */}
      <VirtualKeyboard
        targetKeyInfo={currentKeyInfo}
        lastPressedKey={lastPressedKey}
        isErrorKey={isLastKeyError}
      />

      {/* Completion Modal */}
      <AnimatePresence>
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Trophy className="w-6 h-6 animate-bounce" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {accuracy >= 95
                  ? (isBn ? 'লেসন সম্পন্ন হয়েছে!' : 'Lesson Mastered!')
                  : (isBn ? 'অনুশীলন সম্পন্ন' : 'Practice Complete')}
              </h3>

              <p className="text-xs text-slate-500 mt-1 mb-4">
                {accuracy >= 95
                  ? (isBn ? 'চমৎকার! আপনি ৯৫%+ নির্ভুলতা বজায় রেখেছেন।' : 'Great accuracy on this drill!')
                  : (isBn ? 'আরেকবার চেষ্টা করে ৯৫%+ একুরেসি আনুন।' : 'Try again for 95%+ accuracy.')}
              </p>

              {/* Star Rating */}
              <div className="flex justify-center gap-1.5 mb-4">
                {[1, 2, 3].map((starIndex) => {
                  const isEarned =
                    (accuracy >= 98 && starIndex <= 3) ||
                    (accuracy >= 94 && starIndex <= 2) ||
                    (accuracy >= 85 && starIndex <= 1);
                  return (
                    <Star
                      key={starIndex}
                      className={`w-6 h-6 ${
                        isEarned
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-mono mb-5 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBn ? 'একুরেসি' : 'Acc'}</div>
                  <div className={`text-base font-bold ${accuracy >= 95 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-500'}`}>
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBn ? 'স্পিড' : 'Speed'}</div>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200">{liveWpm} WPM</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBn ? 'পয়েন্ট' : 'XP'}</div>
                  <div className="text-base font-bold text-purple-600">+{lesson.xpReward}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {accuracy >= 95 && onNextLesson ? (
                  <button
                    id="btn-modal-next-lesson"
                    onClick={() => {
                      setIsCompleted(false);
                      onNextLesson();
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                  >
                    <span>{isBn ? 'পরবর্তী লেসন (Enter)' : 'Next Lesson (Enter)'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : null}

                <button
                  id="btn-modal-retry"
                  onClick={() => {
                    setIsCompleted(false);
                    resetPractice();
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'আবার চেষ্টা করুন (Esc)' : 'Retry (Esc)'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
