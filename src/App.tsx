/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppTab, 
  Language, 
  SoundEffectType, 
  UserStats, 
  Lesson 
} from './types';
import { MODULES_DATA, BADGES_DATA } from './utils/keyboardMap';
import { Header } from './components/Header';
import { ModuleList } from './components/ModuleList';
import { TypingArena } from './components/TypingArena';
import { MiniGameSkyFall } from './components/MiniGameSkyFall';
import { CustomPracticeArena } from './components/CustomPracticeArena';
import { BadgeGallery } from './components/BadgeGallery';
import { SmartPracticeModal } from './components/SmartPracticeModal';
import { CertificateModal } from './components/CertificateModal';
import { OnboardingModal } from './components/OnboardingModal';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, Award, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  // Load saved state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('typemaster_lang') as Language) || 'bn';
  });

  const [soundType, setSoundType] = useState<SoundEffectType>(() => {
    return (localStorage.getItem('typemaster_sound') as SoundEffectType) || 'mechanical';
  });

  const [currentTab, setCurrentTab] = useState<AppTab>('learn');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // User Stats with local storage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check daily streak
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
      // Fallback
    }
    return INITIAL_USER_STATS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('typemaster_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('typemaster_sound', soundType);
  }, [soundType]);

  // First time visitor onboarding check
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('typemaster_onboarding_seen');
    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
      localStorage.setItem('typemaster_onboarding_seen', 'true');
    }
  }, []);

  // Handle lesson completion & badge unlocking logic
  const handleLessonComplete = useCallback((result: {
    lessonId: string;
    accuracy: number;
    wpm: number;
    stars: number;
    mistakes: Record<string, number>;
  }) => {
    setUserStats((prev) => {
      const updatedCompleted = {
        ...prev.completedLessons,
        [result.lessonId]: {
          stars: Math.max(result.stars, prev.completedLessons[result.lessonId]?.stars || 0),
          accuracy: Math.max(result.accuracy, prev.completedLessons[result.lessonId]?.accuracy || 0),
          wpm: Math.max(result.wpm, prev.completedLessons[result.lessonId]?.wpm || 0),
          completedAt: new Date().toISOString(),
        },
      };

      const xpEarned = (result.stars * 35) + (result.accuracy >= 98 ? 30 : 15);
      const newXp = prev.xp + xpEarned;
      const newLevel = Math.floor(newXp / 250) + 1;

      // Update weak keys mistakes map
      const newMistakes = { ...prev.keyMistakes };
      for (const [key, count] of Object.entries(result.mistakes)) {
        newMistakes[key] = (newMistakes[key] || 0) + count;
      }

      // Check badges to unlock
      const badgesToUnlock = new Set(prev.unlockedBadges);

      // Badge: First Touch
      badgesToUnlock.add('first-key');

      // Badge: Pure Accuracy
      if (result.accuracy === 100) {
        badgesToUnlock.add('pure-accuracy');
      }

      // Badge: Speed Demon
      if (result.wpm >= 40) {
        badgesToUnlock.add('speed-demon');
      }

      // Check Module 1 completion
      const module1Lessons = MODULES_DATA[0].lessons.map((l) => l.id);
      const m1Finished = module1Lessons.every((id) => updatedCompleted[id]);
      if (m1Finished) {
        badgesToUnlock.add('home-row-ninja');
      }

      // Check Module 2 completion
      const module2Lessons = MODULES_DATA[1].lessons.map((l) => l.id);
      const m2Finished = module2Lessons.every((id) => updatedCompleted[id]);
      if (m2Finished) {
        badgesToUnlock.add('top-bottom-explorer');
      }

      // Check Module 3 completion
      const module3Lessons = MODULES_DATA[2].lessons.map((l) => l.id);
      const m3Finished = module3Lessons.every((id) => updatedCompleted[id]);
      if (m3Finished) {
        badgesToUnlock.add('shift-specialist');
      }

      // Check all modules completed -> Graduate
      const totalLessonsCount = MODULES_DATA.reduce((acc, m) => acc + m.lessons.length, 0);
      if (Object.keys(updatedCompleted).length >= totalLessonsCount) {
        badgesToUnlock.add('graduate');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        completedLessons: updatedCompleted,
        keyMistakes: newMistakes,
        unlockedBadges: Array.from(badgesToUnlock),
      };
    });
  }, []);

  // Handle Mini Game Skyfall score
  const handleGameComplete = useCallback((score: number, maxCombo: number) => {
    setUserStats((prev) => {
      const xpEarned = Math.floor(score / 5);
      const newXp = prev.xp + xpEarned;
      const newLevel = Math.floor(newXp / 250) + 1;
      const badgesToUnlock = new Set(prev.unlockedBadges);

      if (score >= 300) {
        badgesToUnlock.add('skyfall-hero');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        unlockedBadges: Array.from(badgesToUnlock),
      };
    });
  }, []);

  // Navigate to next lesson in sequence
  const handleNextLesson = () => {
    if (!activeLesson) return;

    // Find current lesson index in all lessons
    const allLessons: Lesson[] = MODULES_DATA.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);

    if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
      setActiveLesson(allLessons[currentIndex + 1]);
    } else {
      // Completed all lessons! Open certificate
      setIsCertificateOpen(true);
      setActiveLesson(null);
    }
  };

  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Sticky Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setActiveLesson(null);
        }}
        language={language}
        onLanguageChange={setLanguage}
        soundType={soundType}
        onSoundChange={setSoundType}
        userStats={userStats}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenSmartModal={() => setIsSmartModalOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* If an active lesson is selected, render TypingArena */}
        {activeLesson ? (
          <div className="w-full flex flex-col gap-4">
            <button
              id="btn-back-to-modules"
              onClick={() => setActiveLesson(null)}
              className="self-start px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'পাঠ্যক্রম তালিকায় ফিরে যান' : 'Back to Curriculum'}</span>
            </button>

            <TypingArena
              lesson={activeLesson}
              language={language}
              soundType={soundType}
              userStats={userStats}
              onLessonComplete={handleLessonComplete}
              onNextLesson={handleNextLesson}
              onSelectAnotherLesson={() => setActiveLesson(null)}
            />
          </div>
        ) : (
          /* Main Tab Views */
          <div>
            {currentTab === 'learn' && (
              <ModuleList
                userStats={userStats}
                language={language}
                onSelectLesson={(lesson) => setActiveLesson(lesson)}
              />
            )}

            {currentTab === 'game' && (
              <MiniGameSkyFall
                language={language}
                soundType={soundType}
                onGameComplete={handleGameComplete}
              />
            )}

            {currentTab === 'custom-test' && (
              <CustomPracticeArena
                language={language}
                soundType={soundType}
                userStats={userStats}
                onLessonComplete={handleLessonComplete}
              />
            )}

            {currentTab === 'badges' && (
              <BadgeGallery
                userStats={userStats}
                language={language}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartBeginner={() => {
          setIsOnboardingOpen(false);
          setActiveLesson(MODULES_DATA[0].lessons[0]);
        }}
        language={language}
      />

      <SmartPracticeModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
        userStats={userStats}
        language={language}
        onStartCustomDrill={(customLesson) => {
          setActiveLesson(customLesson);
        }}
      />

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        userStats={userStats}
        language={language}
        onUpdateUserName={(name) => {
          setUserStats((prev) => ({ ...prev, userName: name }));
        }}
      />
    </div>
  );
}
