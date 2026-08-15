import React from 'react';
import { Language, Lesson, ThemeMode } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';

interface HeaderProps {
  currentLesson: Lesson | null;
  language: Language;
  theme: ThemeMode;
  onOpenCurriculum: () => void;
  onOpenSettings: () => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  isNextLessonUnlocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLesson,
  language,
  theme,
  onOpenCurriculum,
  onOpenSettings,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson,
  isNextLessonUnlocked,
}) => {
  const isBn = language === 'bn';
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  return (
    <header className={`w-full transition-colors z-20 border-b ${
      isDark
        ? 'bg-slate-950 border-slate-800/80 text-slate-200'
        : isSepia
        ? 'bg-[#fbf7ee] border-[#e6d8c3] text-stone-800'
        : 'bg-white border-slate-200/80 text-slate-800'
    }`}>
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={onOpenCurriculum}
          className="flex items-center gap-2.5 cursor-pointer select-none opacity-90 hover:opacity-100 transition-opacity"
          title="Type Shikho"
        >
          <BrandLogo size={24} />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-tight">
              Type Shikho
            </span>
          </div>
        </div>

        {/* Center: Minimal Lesson Switcher */}
        {currentLesson && (
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 px-1.5 py-1 rounded-xl">
            <button
              id="nav-prev-lesson"
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              title={isBn ? 'পূর্ববর্তী লেসন' : 'Previous Lesson'}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 disabled:opacity-20 transition-all cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-current-lesson-dropdown"
              onClick={onOpenCurriculum}
              className="px-2.5 py-0.5 text-xs font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer truncate max-w-[180px] sm:max-w-[280px]"
            >
              {isBn ? currentLesson.titleBn : currentLesson.titleEn}
            </button>

            <button
              id="nav-next-lesson"
              onClick={() => {
                if (isNextLessonUnlocked) onNextLesson();
              }}
              disabled={!hasNextLesson || !isNextLessonUnlocked}
              title={isBn ? 'পরবর্তী লেসন' : 'Next Lesson'}
              className={`p-1 rounded-lg transition-all ${
                !isNextLessonUnlocked || !hasNextLesson
                  ? 'opacity-25 cursor-not-allowed'
                  : 'opacity-60 hover:opacity-100 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {!isNextLessonUnlocked && hasNextLesson ? (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Right: Only the Settings Gear Icon */}
        <div className="flex items-center">
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title={isBn ? 'সেটিংস' : 'Settings'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

