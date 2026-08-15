import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson, Language, SoundEffectType, UserStats, KeyFingerInfo, ThemeMode } from '../types';
import { getKeyInfoForChar } from '../utils/keyboardMap';
import { playKeySound, playErrorSound, playCelebrationFanfare } from '../utils/audio';
import { 
  speakText, 
  getLessonSpokenGuide, 
  stopSpeaking, 
  unlockAudioContext, 
  preloadLessonAudio,
  subscribeToSpeechState,
  isAudioSpeaking,
  getCurrentSpokenText
} from '../utils/speech';
import { VirtualKeyboard } from './VirtualKeyboard';
import { MiniGameSkyFall } from './MiniGameSkyFall';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  ArrowRight, 
  Star, 
  Trophy,
  Gamepad2,
  Volume2,
  VolumeX,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  Eye,
  Target
} from 'lucide-react';

interface TypingArenaProps {
  lesson: Lesson;
  language: Language;
  soundType: SoundEffectType;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  userStats: UserStats;
  theme?: ThemeMode;
  isNextLessonUnlocked?: boolean;
  onLessonComplete: (result: { lessonId: string; accuracy: number; wpm: number; stars: number; mistakes: Record<string, number> }) => void;
  onNextLesson?: () => void;
  onSelectAnotherLesson?: () => void;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  lesson,
  language,
  soundType,
  voiceEnabled = true,
  onToggleVoice,
  userStats,
  theme = 'light',
  isNextLessonUnlocked = false,
  onLessonComplete,
  onNextLesson,
  onSelectAnotherLesson,
}) => {
  const isBn = language === 'bn';
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  // Voice speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(() => isAudioSpeaking());
  const [currentSpokenText, setCurrentSpokenText] = useState<string>(() => getCurrentSpokenText());

  // Subscribe to speech state
  useEffect(() => {
    const unsubscribe = subscribeToSpeechState((speaking, text) => {
      setIsSpeaking(speaking);
      setCurrentSpokenText(text);
    });
    return unsubscribe;
  }, []);

  const handleGameComplete = useCallback((score: number) => {
    const stars = score >= 200 ? 3 : score >= 100 ? 2 : 1;
    const isPassed = score >= 100;
    onLessonComplete({
      lessonId: lesson.id,
      accuracy: isPassed ? 95 : 75,
      wpm: Math.min(60, Math.floor(score / 8)),
      stars: isPassed ? stars : 0,
      mistakes: {},
    });
  }, [lesson.id, onLessonComplete]);

  // Ref to track if voice guide has spoken for the current lesson
  const hasSpokenForLessonRef = useRef<boolean>(false);

  // Trigger lesson voice guidance
  const playLessonVoice = useCallback(() => {
    stopSpeaking();
    unlockAudioContext();
    hasSpokenForLessonRef.current = true;
    const spokenGuide = getLessonSpokenGuide(lesson, language);
    speakText(spokenGuide, language, true);
  }, [lesson, language]);

  // Typing state
  const targetText = lesson.targetText || '';
  const [typedInput, setTypedInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [combo, setCombo] = useState<number>(0);
  const [mistakesMap, setMistakesMap] = useState<Record<string, number>>({});
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [isLastKeyError, setIsLastKeyError] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  // Hidden focus textarea
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Typewriter animation for Lesson 1 welcome banner
  const fullWelcomeText = isBn
    ? 'NIBARON Type Shikho তে আপনাকে স্বাগতম। আপনার টাইপিং শেখার পথটা সুন্দর হোক।'
    : 'Welcome to NIBARON Type Shikho. Wish you a wonderful typing journey!';
  
  const [displayedWelcome, setDisplayedWelcome] = useState<string>('');
  const [isTypingAnimationDone, setIsTypingAnimationDone] = useState<boolean>(false);

  useEffect(() => {
    if (lesson.id !== 'm1-l1') return;
    setDisplayedWelcome('');
    setIsTypingAnimationDone(false);

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      if (charIndex <= fullWelcomeText.length) {
        setDisplayedWelcome(fullWelcomeText.slice(0, charIndex));
      } else {
        setIsTypingAnimationDone(true);
        clearInterval(interval);
      }
    }, 38);

    return () => clearInterval(interval);
  }, [lesson.id, fullWelcomeText]);

  // Reset function
  const resetPractice = useCallback(() => {
    stopSpeaking();
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

  // When lesson changes or loads: reset, preload and proactively trigger speech
  useEffect(() => {
    resetPractice();
    preloadLessonAudio(lesson, language);
    hasSpokenForLessonRef.current = false;

    // 1. Proactively attempt immediate autoplay speech
    if (voiceEnabled && lesson.type !== 'game') {
      const spokenGuide = getLessonSpokenGuide(lesson, language);
      speakText(spokenGuide, language, true, () => {
        hasSpokenForLessonRef.current = true;
      });
    }

    // 2. Comprehensive interaction listeners (mousemove, pointermove, keydown, touchstart, focus)
    // to guarantee speech fires on the very first micro-movement or keypress if browser autoplay hesitated
    const triggerAudioOnInteraction = () => {
      unlockAudioContext();
      if (voiceEnabled && !hasSpokenForLessonRef.current) {
        hasSpokenForLessonRef.current = true;
        playLessonVoice();
      }
    };

    const events = ['pointerdown', 'keydown', 'touchstart', 'mousemove', 'pointermove', 'focus', 'wheel', 'mousedown'];
    events.forEach((evt) => window.addEventListener(evt, triggerAudioOnInteraction, { once: true, passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, triggerAudioOnInteraction));
    };
  }, [lesson.id, voiceEnabled, language, playLessonVoice, resetPractice]);

  // Clean up speech when unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Global click & focus maintainer
  useEffect(() => {
    inputRef.current?.focus();
    const handleWindowClick = (e: MouseEvent) => {
      unlockAudioContext();
      
      const target = e.target as HTMLElement;
      if (
        target.closest('button') || 
        target.closest('input') || 
        target.closest('select') || 
        target.closest('[role="dialog"]')
      ) {
        return;
      }
      inputRef.current?.focus();
    };

    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Keystroke metrics calculation
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
  const progressPercent = targetText.length > 0 ? Math.min(100, Math.round((totalTyped / targetText.length) * 100)) : 0;

  // Finish Lesson logic
  const handleFinishLesson = useCallback((finalTypedText: string, finalErrorSet: Set<number>, finalMistakes: Record<string, number>) => {
    const finishTime = Date.now();
    setEndTime(finishTime);
    setIsCompleted(true);

    const totalMinutes = (finishTime - (startTime || finishTime)) / 60000;
    const finalWpm = totalMinutes > 0 ? Math.round((targetText.length / 5) / totalMinutes) : 28;
    const finalAccuracy = Math.max(0, Math.round(((targetText.length - finalErrorSet.size) / targetText.length) * 100));

    let stars = 1;
    if (finalAccuracy >= 98) {
      stars = 3;
    } else if (finalAccuracy >= 94) {
      stars = 2;
    } else if (finalAccuracy < 90) {
      stars = 0;
    }

    if (finalAccuracy >= 90) {
      playCelebrationFanfare();
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (voiceEnabled) {
        speakText(
          isBn
            ? `চমৎকার! আপনি ${finalAccuracy}% নির্ভুলতার সাথে লেসন সম্পন্ন করেছেন।`
            : `Great job! You completed this lesson with ${finalAccuracy}% accuracy.`,
          language,
          true
        );
      }
    }

    onLessonComplete({
      lessonId: lesson.id,
      accuracy: finalAccuracy,
      wpm: finalWpm,
      stars,
      mistakes: finalMistakes,
    });
  }, [startTime, targetText, voiceEnabled, isBn, language, onLessonComplete, lesson.id]);

  // Keystroke Processor
  const processKey = useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }

    if (isCompleted || lesson.type === 'game') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      resetPractice();
      return;
    }

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (typedInput.length > 0) {
        const lastIdx = typedInput.length - 1;
        setTypedInput((prev) => prev.slice(0, -1));
        
        setErrorIndices((prev) => {
          const next = new Set(prev);
          next.delete(lastIdx);
          return next;
        });

        setLastPressedKey('Backspace');
        setIsLastKeyError(false);
        playKeySound(soundType, false);
      }
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

      if (newTyped.length === targetText.length) {
        handleFinishLesson(newTyped, errorIndices, mistakesMap);
      }
    } else {
      setIsLastKeyError(true);
      playErrorSound(soundType);
      setCombo(0);

      const updatedMistakes = {
        ...mistakesMap,
        [expectedChar]: (mistakesMap[expectedChar] || 0) + 1,
      };
      setMistakesMap(updatedMistakes);

      const updatedErrors = new Set(errorIndices).add(currentIndex);
      setErrorIndices(updatedErrors);

      const newTyped = typedInput + pressedChar;
      setTypedInput(newTyped);

      if (newTyped.length === targetText.length) {
        handleFinishLesson(newTyped, updatedErrors, updatedMistakes);
      }
    }
  }, [currentIndex, errorIndices, handleFinishLesson, isCompleted, lesson.type, mistakesMap, resetPractice, soundType, startTime, targetText, typedInput]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      unlockAudioContext();
      if (lesson.type === 'game') return;

      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || (activeEl.tagName === 'TEXTAREA' && activeEl !== inputRef.current));
      
      if (isInputFocused) return;

      if (e.getModifierState) {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }

      if (isCompleted) {
        if (e.key === 'Enter') {
          e.preventDefault();
          setIsCompleted(false);
          if (accuracy >= 90 && onNextLesson) {
            onNextLesson();
          } else {
            resetPractice();
          }
          return;
        }

        if (e.key === 'Escape' || e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          setIsCompleted(false);
          resetPractice();
          return;
        }
      }

      if (!isCompleted) {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
        processKey(e);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [accuracy, isCompleted, lesson.type, onNextLesson, processKey]);

  // If this is a Game Checkpoint Lesson
  if (lesson.type === 'game') {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3 py-1">
        <div className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-colors shadow-xs ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : isSepia
            ? 'bg-[#f4ede0] border-[#e2d5c3]'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {isBn ? lesson.titleBn : lesson.titleEn}
              </h2>
              <p className="text-xs opacity-75">
                {isBn ? lesson.descriptionBn : lesson.descriptionEn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={playLessonVoice}
              title={isBn ? 'নির্দেশনা শুনুন' : 'Listen to voice guide'}
              className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            {onSelectAnotherLesson && (
              <button
                onClick={onSelectAnotherLesson}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {isBn ? 'সকল লেসন' : 'All Lessons'}
              </button>
            )}
          </div>
        </div>

        <MiniGameSkyFall
          language={language}
          soundType={soundType}
          voiceEnabled={voiceEnabled}
          moduleId={lesson.moduleId}
          onGameComplete={handleGameComplete}
          onNextLesson={onNextLesson}
        />
      </div>
    );
  }

  return (
    <div 
      id="typing-arena-container" 
      onClick={() => {
        unlockAudioContext();
        inputRef.current?.focus();
      }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3"
    >
      {/* Hidden textarea to capture mobile or accessibility inputs */}
      <textarea
        ref={inputRef}
        value={typedInput}
        onChange={() => {}}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="sr-only"
        autoFocus
        aria-label="Typing input area"
      />

      {/* Prominent Caps Lock Warning Banner - sleek and minimal */}
      {isCapsLockOn && (
        <div 
          id="capslock-warning"
          className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl flex items-center justify-between text-xs font-mono"
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CAPS LOCK ON</span>
          </div>
        </div>
      )}

      {/* Minimal Top Controls Bar */}
      <div 
        className="w-full flex items-center justify-between px-2 py-1 select-none font-mono text-xs text-slate-500"
      >
        <div className="flex items-center gap-2">
          {onToggleVoice && (
            <button
              id="btn-arena-voice-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVoice();
              }}
              title={voiceEnabled ? (isBn ? 'ভয়েস বন্ধ করুন' : 'Mute Voice') : (isBn ? 'ভয়েস চালু করুন' : 'Enable Voice')}
              className="p-1 rounded-lg hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-teal-600 animate-pulse" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
          )}
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-3">
          <span>
            {accuracy}%
          </span>
          <span>
            {liveWpm} wpm
          </span>
          <button
            id="btn-restart-lesson"
            onClick={(e) => {
              e.stopPropagation();
              resetPractice();
            }}
            title="Esc"
            className="p-1 rounded-lg hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Minimal First-Lesson Welcome Greeting with real Typing Animation & Beginner Advice */}
      {lesson.id === 'm1-l1' && typedInput.length === 0 && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full flex flex-col gap-2.5 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-teal-700 dark:text-teal-300 select-none shadow-xs"
        >
          {/* Main animated typewriter welcome banner */}
          <div className="flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-teal-500 animate-pulse shrink-0" />
            <span className="leading-snug">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {displayedWelcome}
              </span>
              {!isTypingAnimationDone && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-teal-500 animate-pulse align-middle" />
              )}
            </span>
          </div>

          {/* Quick Beginner Tips (একদম নতুন শিক্ষার্থীর জন্য গুরুত্বপূর্ণ পরামর্শ) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-teal-500/20 text-[11px] sm:text-xs">
            <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 dark:bg-slate-900/50">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">{isBn ? 'হাত রাখার নিয়ম:' : 'Position:'}</strong>{' '}
                <span className="text-slate-600 dark:text-slate-400">
                  {isBn ? 'বাম তর্জনী F এবং ডান তর্জনী J-এর খাঁজে রাখুন।' : 'Left index on F, right on J.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 dark:bg-slate-900/50">
              <Eye className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">{isBn ? 'সোনার নিয়ম:' : 'Golden Rule:'}</strong>{' '}
                <span className="text-slate-600 dark:text-slate-400">
                  {isBn ? 'কীবোর্ডে না তাকিয়ে শুধু স্ক্রিনের দিকে তাকিয়ে টাইপ করুন।' : 'Look at the screen, never look at keys.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 dark:bg-slate-900/50">
              <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">{isBn ? 'নির্ভুলতা:' : 'Accuracy:'}</strong>{' '}
                <span className="text-slate-600 dark:text-slate-400">
                  {isBn ? 'শুরুতে গতির চেয়ে ভুল না করার দিকে নজর দিন।' : 'Focus on 100% accuracy over raw speed.'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Text Display Arena (The Central Hero Focus) */}
      <div
        id="text-stream-box"
        ref={textContainerRef}
        className={`w-full min-h-[120px] px-6 py-6 rounded-2xl cursor-text relative flex flex-col justify-center select-none overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900/70 border border-slate-800/80'
            : isSepia
            ? 'bg-[#f4ede0]/80 border border-[#e2d5c3]'
            : 'bg-white border border-slate-200/80'
        }`}
      >
        {/* Subtle Lesson Progress Line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${isDark ? 'bg-slate-800' : isSepia ? 'bg-[#e4d6c4]' : 'bg-slate-100'}`}>
          <div 
            className="h-full bg-teal-500 transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Text Stream */}
        <div className="font-mono text-xl sm:text-2xl md:text-3xl tracking-wider leading-relaxed flex flex-wrap items-center">
          {targetText.split('').map((char, index) => {
            const isTyped = index < typedInput.length;
            const isCurrent = index === currentIndex;
            const isError = errorIndices.has(index);

            let charClass = '';

            if (isTyped) {
              if (isError) {
                charClass = 'text-rose-500 bg-rose-500/15 rounded-sm px-0.5 font-bold';
              } else {
                charClass = isDark ? 'text-teal-400 font-medium' : 'text-teal-600 font-medium';
              }
            } else if (isCurrent) {
              charClass = isDark
                ? 'text-white font-bold bg-teal-500/25 rounded-sm px-0.5 ring-1 ring-teal-400'
                : isSepia
                ? 'text-stone-900 font-bold bg-amber-500/25 rounded-sm px-0.5 ring-1 ring-amber-500'
                : 'text-slate-900 font-bold bg-teal-500/20 rounded-sm px-0.5 ring-1 ring-teal-500';
            } else {
              charClass = isDark
                ? 'text-slate-600'
                : isSepia
                ? 'text-stone-400'
                : 'text-slate-400';
            }

            return (
              <span key={index} className={`relative inline-flex items-center transition-all duration-75 ${charClass}`}>
                {/* Blinking Vertical Caret */}
                {isCurrent && (
                  <span className="inline-block w-0.5 h-6 sm:h-7 bg-teal-500 animate-pulse -mr-0.5 rounded-full" />
                )}
                {char === ' ' ? (
                  <span className={`inline-block min-w-[0.55em] ${isCurrent ? 'bg-teal-500/30 rounded-sm' : ''}`}>
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

      {/* Virtual Keyboard Guide (Crisp & Responsive) */}
      <VirtualKeyboard
        targetKeyInfo={currentKeyInfo}
        lastPressedKey={lastPressedKey}
        isErrorKey={isLastKeyError}
        theme={theme}
      />

      {/* Completion Modal */}
      <AnimatePresence>
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : isSepia
                  ? 'bg-[#FAF7F2] border-[#dfcdb8] text-stone-900'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-2.5 rounded-2xl flex items-center justify-center ${
                accuracy >= 90 ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {accuracy >= 90 ? (
                  <Trophy className="w-6 h-6 animate-bounce" />
                ) : (
                  <RotateCcw className="w-6 h-6" />
                )}
              </div>

              <h3 className="text-lg font-bold">
                {accuracy >= 90
                  ? (isBn ? 'লেসন সফলভাবে সম্পন্ন!' : 'Lesson Mastered!')
                  : (isBn ? 'পুনরায় চেষ্টা করুন' : 'Needs Practice')}
              </h3>

              <p className="text-xs opacity-70 mt-1 mb-3 leading-relaxed">
                {accuracy >= 90
                  ? (isBn ? 'চমৎকার! আপনি ৯০%+ নির্ভুলতায় পরবর্তী লেসন আনলক করেছেন।' : 'Great accuracy! Next lesson unlocked.')
                  : (isBn ? 'পরবর্তী লেসন আনলক করতে কমপক্ষে ৯০% নির্ভুলতা প্রয়োজন।' : 'Score at least 90% accuracy to unlock next lesson.')}
              </p>

              {/* Star Rating */}
              <div className="flex justify-center gap-1.5 mb-3.5">
                {[1, 2, 3].map((starIndex) => {
                  const isEarned =
                    (accuracy >= 98 && starIndex <= 3) ||
                    (accuracy >= 94 && starIndex <= 2) ||
                    (accuracy >= 90 && starIndex <= 1);
                  return (
                    <Star
                      key={starIndex}
                      className={`w-5 h-5 ${
                        isEarned
                          ? 'text-amber-400 fill-amber-400'
                          : isDark
                          ? 'text-slate-800'
                          : 'text-slate-200'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Stats */}
              <div className={`grid grid-cols-3 gap-2 p-2.5 rounded-xl border font-mono mb-4 text-center ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700'
                  : isSepia
                  ? 'bg-[#ebdcc9] border-[#dfcdb8]'
                  : 'bg-slate-50 border-slate-100'
              }`}>
                <div>
                  <div className="text-[9px] opacity-60 uppercase font-semibold">{isBn ? 'একুরেসি' : 'Acc'}</div>
                  <div className={`text-sm font-bold ${accuracy >= 90 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500'}`}>
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] opacity-60 uppercase font-semibold">{isBn ? 'স্পিড' : 'Speed'}</div>
                  <div className="text-sm font-bold">{liveWpm} WPM</div>
                </div>
                <div>
                  <div className="text-[9px] opacity-60 uppercase font-semibold">{isBn ? 'পয়েন্ট' : 'XP'}</div>
                  <div className="text-sm font-bold text-purple-600">+{accuracy >= 90 ? lesson.xpReward : 20}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {accuracy >= 90 && onNextLesson ? (
                  <>
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
                    <button
                      id="btn-modal-retry"
                      onClick={() => {
                        setIsCompleted(false);
                        resetPractice();
                      }}
                      className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isBn ? 'আবার অনুশীলন করুন (Esc / R)' : 'Retry Drill (Esc / R)'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    id="btn-modal-retry"
                    onClick={() => {
                      setIsCompleted(false);
                      resetPractice();
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isBn ? 'আবার চেষ্টা করুন (Enter)' : 'Try Again (Enter)'}</span>
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
