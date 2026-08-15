/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Language, 
  SoundEffectType, 
  UserStats, 
  Lesson,
  ThemeMode
} from './types';
import { MODULES_DATA } from './utils/keyboardMap';
import { Header } from './components/Header';
import { TypingArena } from './components/TypingArena';
import { ModuleList } from './components/ModuleList';
import { CustomPracticeArena } from './components/CustomPracticeArena';
import { SmartPracticeModal } from './components/SmartPracticeModal';
import { CertificateModal } from './components/CertificateModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { ArrowLeft } from 'lucide-react';
import { stopSpeaking, preloadLessonAudio } from './utils/speech';

const STORAGE_KEY = 'typemaster_user_data_v1';

const INITIAL_USER_STATS: UserStats = {
  xp: 0,
  level: 1,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: {},
  unlockedModules: ['module-1'],
  totalKeysTyped: 0,
  totalErrors: 0,
  totalTimeSpentSeconds: 0,
  keyMistakes: {},
  keyHits: {},
  unlockedBadges: [],
  userName: 'Touch Typist Student',
};

export default function App() {
  // Theme setting (light / dark / sepia) - Defaulting to dark mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('typemaster_theme') as ThemeMode) || 'dark';
  });

  // Language & Sound & Voice settings
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('typemaster_lang') as Language) || 'bn';
  });

  const [soundType, setSoundType] = useState<SoundEffectType>(() => {
    return (localStorage.getItem('typemaster_sound') as SoundEffectType) || 'mechanical';
  });

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('typemaster_voice_enabled');
    return saved === null ? true : saved === 'true';
  });

  // User stats from localStorage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        const lastDate = parsed.lastActiveDate;
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (lastDate === yesterday) {
            parsed.streakDays = (parsed.streakDays || 0) + 1;
          } else {
            parsed.streakDays = 1;
          }
          parsed.lastActiveDate = today;
        }
        return parsed;
      }
    } catch {
      // Fallback to initial
    }
    return INITIAL_USER_STATS;
  });

  // Flat list of all lessons across all modules
  const allLessons: Lesson[] = useMemo(() => {
    return MODULES_DATA.flatMap((m) => m.lessons);
  }, []);

  // Helper to check if a specific lesson is unlocked
  const isLessonUnlocked = useCallback((lessonId: string): boolean => {
    const index = allLessons.findIndex((l) => l.id === lessonId);
    if (index <= 0) return true; // first lesson is always unlocked
    const prevLesson = allLessons[index - 1];
    const prevRecord = userStats.completedLessons[prevLesson.id];
    return !!prevRecord && (prevRecord.accuracy >= 90 || prevRecord.stars >= 1);
  }, [allLessons, userStats.completedLessons]);

  // Active Lesson (Ensure unlocked)
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    const savedLessonId = localStorage.getItem('typemaster_active_lesson_id');
    if (savedLessonId) {
      const found = allLessons.find((l) => l.id === savedLessonId);
      if (found) return found;
    }
    return MODULES_DATA[0].lessons[0];
  });

  // Modal / View states
  const [isCurriculumOpen, setIsCurriculumOpen] = useState<boolean>(false);
  const [isCustomPracticeOpen, setIsCustomPracticeOpen] = useState<boolean>(false);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('typemaster_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('typemaster_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('typemaster_sound', soundType);
  }, [soundType]);

  useEffect(() => {
    localStorage.setItem('typemaster_voice_enabled', voiceEnabled.toString());
  }, [voiceEnabled]);

  useEffect(() => {
    if (activeLesson) {
      localStorage.setItem('typemaster_active_lesson_id', activeLesson.id);
    }
  }, [activeLesson]);

  // First time visitor voice pre-warming
  useEffect(() => {
    // Pre-buffer first lessons so speech starts with zero delay
    MODULES_DATA[0].lessons.slice(0, 5).forEach((l) => preloadLessonAudio(l, language));
  }, [language]);

  // Navigation helpers
  const currentLessonIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const hasPrevLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex !== -1 && currentLessonIndex < allLessons.length - 1;
  const nextLesson = hasNextLesson ? allLessons[currentLessonIndex + 1] : null;
  const isNextLessonUnlocked = nextLesson ? isLessonUnlocked(nextLesson.id) : false;

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      stopSpeaking();
      setActiveLesson(allLessons[currentLessonIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson && nextLesson && isLessonUnlocked(nextLesson.id)) {
      stopSpeaking();
      setActiveLesson(nextLesson);
    } else if (!hasNextLesson) {
      setIsCertificateOpen(true);
    }
  };

  // Lesson completion handler
  const handleLessonComplete = useCallback((result: {
    lessonId: string;
    accuracy: number;
    wpm: number;
    stars: number;
    mistakes: Record<string, number>;
  }) => {
    setUserStats((prev) => {
      const isPassed = result.accuracy >= 90 || result.stars >= 1;
      const prevRecord = prev.completedLessons[result.lessonId];

      const updatedCompleted = {
        ...prev.completedLessons,
        ...(isPassed ? {
          [result.lessonId]: {
            stars: Math.max(result.stars, prevRecord?.stars || 0),
            accuracy: Math.max(result.accuracy, prevRecord?.accuracy || 0),
            wpm: Math.max(result.wpm, prevRecord?.wpm || 0),
            completedAt: new Date().toISOString(),
          }
        } : {}),
      };

      const xpEarned = isPassed ? (result.stars * 40) + (result.accuracy >= 98 ? 30 : 15) : 10;
      const newXp = prev.xp + xpEarned;
      const newLevel = Math.floor(newXp / 250) + 1;

      // Update weak keys map
      const newMistakes = { ...prev.keyMistakes };
      for (const [key, count] of Object.entries(result.mistakes)) {
        newMistakes[key] = (newMistakes[key] || 0) + count;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        completedLessons: updatedCompleted,
        keyMistakes: newMistakes,
      };
    });
  }, []);

  const handleResetProgress = () => {
    const resetStats: UserStats = {
      ...INITIAL_USER_STATS,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    setUserStats(resetStats);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('typemaster_active_lesson_id');
    stopSpeaking();
    setActiveLesson(MODULES_DATA[0].lessons[0]);
  };

  const toggleSound = () => {
    setSoundType((prev) => (prev === 'mute' ? 'mechanical' : 'mute'));
  };

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      if (prev) {
        stopSpeaking();
      }
      return !prev;
    });
  };

  const isBn = language === 'bn';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-200 ${
      theme === 'dark'
        ? 'bg-slate-950 text-slate-100 dark'
        : theme === 'sepia'
        ? 'bg-[#fbf7ee] text-stone-800'
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Clean Minimal Header */}
      <Header
        currentLesson={activeLesson}
        language={language}
        theme={theme}
        onOpenCurriculum={() => setIsCurriculumOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPrevLesson={handlePrevLesson}
        onNextLesson={handleNextLesson}
        hasPrevLesson={hasPrevLesson}
        hasNextLesson={hasNextLesson}
        isNextLessonUnlocked={isNextLessonUnlocked}
      />

      {/* Main Centered Studio */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
        {isCustomPracticeOpen ? (
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={() => setIsCustomPracticeOpen(false)}
              className="self-start px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'লেসনে ফিরে যান' : 'Back to Lessons'}</span>
            </button>
            <CustomPracticeArena
              language={language}
              soundType={soundType}
              userStats={userStats}
              onLessonComplete={handleLessonComplete}
            />
          </div>
        ) : (
          <TypingArena
            lesson={activeLesson}
            language={language}
            soundType={soundType}
            voiceEnabled={voiceEnabled}
            onToggleVoice={toggleVoice}
            userStats={userStats}
            theme={theme}
            isNextLessonUnlocked={isNextLessonUnlocked}
            onLessonComplete={handleLessonComplete}
            onNextLesson={handleNextLesson}
            onSelectAnotherLesson={() => setIsCurriculumOpen(true)}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoice}
        soundType={soundType}
        onSoundTypeChange={setSoundType}
        userStats={userStats}
        onResetProgress={handleResetProgress}
        onOpenCurriculum={() => setIsCurriculumOpen(true)}
        onOpenCustomPractice={() => setIsCustomPracticeOpen(true)}
        onOpenSmartDrill={() => setIsSmartModalOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />

      {/* Curriculum Roadmap Modal */}
      {isCurriculumOpen && (
        <ModuleList
          userStats={userStats}
          language={language}
          currentLessonId={activeLesson.id}
          onSelectLesson={(lesson) => {
            stopSpeaking();
            setActiveLesson(lesson);
            setIsCustomPracticeOpen(false);
          }}
          onClose={() => setIsCurriculumOpen(false)}
        />
      )}

      {/* Smart Weak Key Analyzer Modal */}
      <SmartPracticeModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
        userStats={userStats}
        language={language}
        onStartCustomDrill={(customLesson) => {
          stopSpeaking();
          setActiveLesson(customLesson);
          setIsCustomPracticeOpen(false);
          setIsSmartModalOpen(false);
        }}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        userStats={userStats}
        language={language}
        onUpdateUserName={(name) => {
          setUserStats((prev) => ({ ...prev, userName: name }));
        }}
      />

      {/* Onboarding Tutorial Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartBeginner={() => {
          setIsOnboardingOpen(false);
          setActiveLesson(MODULES_DATA[0].lessons[0]);
        }}
        language={language}
      />
    </div>
  );
}
