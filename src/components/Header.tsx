import React, { useState } from 'react';
import { Language, SoundEffectType, UserStats, Lesson, ThemeMode } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  Volume2, 
  VolumeX, 
  Globe, 
  BookOpen, 
  Award, 
  BrainCircuit, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Lock,
  Headphones,
  MicOff,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentLesson: Lesson | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  soundType: SoundEffectType;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  userStats: UserStats;
  onOpenCurriculum: () => void;
  onOpenCustomPractice: () => void;
  onOpenSmartDrill: () => void;
  onOpenCertificate: () => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  isNextLessonUnlocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLesson,
  language,
  onLanguageChange,
  soundType,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  theme,
  onThemeChange,
  userStats,
  onOpenCurriculum,
  onOpenCustomPractice,
  onOpenSmartDrill,
  onOpenCertificate,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson,
  isNextLessonUnlocked,
}) => {
  const isBn = language === 'bn';
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'light') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('sepia');
    else onThemeChange('light');
  };

  return (
    <header className={`w-full transition-colors z-40 ${
      isDark
        ? 'bg-slate-950 text-slate-200'
        : isSepia
        ? 'bg-[#fbf7ee] text-stone-800'
        : 'bg-slate-50 text-slate-800'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={onOpenCurriculum}
          className="flex items-center gap-2 cursor-pointer select-none opacity-85 hover:opacity-100 transition-opacity"
          title="Type Shikho"
        >
          <BrandLogo size={24} />
          <span className="font-bold text-sm tracking-tight">
            Type Shikho
          </span>
        </div>

        {/* Center: Minimal Lesson Switcher */}
        {currentLesson && (
          <div className="flex items-center gap-1">
            <button
              id="nav-prev-lesson"
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              title={isBn ? 'পূর্ববর্তী' : 'Previous'}
              className="p-1 rounded-md opacity-50 hover:opacity-100 disabled:opacity-20 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-current-lesson-dropdown"
              onClick={onOpenCurriculum}
              className="px-2 py-0.5 text-xs font-mono font-medium hover:text-teal-500 transition-colors cursor-pointer truncate max-w-[180px] sm:max-w-[260px]"
            >
              {isBn ? currentLesson.titleBn : currentLesson.titleEn}
            </button>

            <button
              id="nav-next-lesson"
              onClick={() => {
                if (isNextLessonUnlocked) onNextLesson();
              }}
              disabled={!hasNextLesson || !isNextLessonUnlocked}
              title={isBn ? 'পরবর্তী' : 'Next'}
              className={`p-1 rounded-md transition-all ${
                !isNextLessonUnlocked || !hasNextLesson
                  ? 'opacity-25 cursor-not-allowed'
                  : 'opacity-50 hover:opacity-100 cursor-pointer'
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

        {/* Right: Minimal Icon Controls */}
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-400">
          {/* Theme */}
          <button
            id="btn-theme-toggle"
            onClick={cycleTheme}
            title={isBn ? 'থিম পরিবর্তন' : 'Theme'}
            className="p-1.5 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
            {theme === 'sepia' && <Sparkles className="w-4 h-4 text-amber-600" />}
          </button>

          {/* Voice Audio Guide */}
          <button
            id="btn-voice-toggle"
            onClick={onToggleVoice}
            title={voiceEnabled ? (isBn ? 'ভয়েস বন্ধ' : 'Voice Off') : (isBn ? 'ভয়েস চালু' : 'Voice On')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              voiceEnabled ? 'text-teal-600 dark:text-teal-400' : 'opacity-40 hover:opacity-80'
            }`}
          >
            {voiceEnabled ? <Headphones className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Key Sounds */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            title={soundType === 'mute' ? (isBn ? 'সাউন্ড চালু' : 'Sound On') : (isBn ? 'সাউন্ড বন্ধ' : 'Sound Off')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              soundType !== 'mute' ? 'text-teal-600 dark:text-teal-400' : 'opacity-40 hover:opacity-80'
            }`}
          >
            {soundType === 'mute' ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Language Switch */}
          <button
            id="btn-lang-toggle"
            onClick={() => onLanguageChange(language === 'bn' ? 'en' : 'bn')}
            className="px-1.5 py-1 text-xs font-mono font-bold hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            title="Language"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              id="btn-more-options"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title="Menu"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {isMenuOpen && (
              <div 
                className={`absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-lg p-1 z-50 flex flex-col gap-0.5 text-xs font-medium border ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : isSepia
                    ? 'bg-[#f4ede0] border-[#dfcdb8] text-stone-800'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <button
                  onClick={onOpenCurriculum}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isBn ? 'পাঠ্যক্রম' : 'Curriculum'}</span>
                </button>

                <button
                  onClick={onOpenCustomPractice}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isBn ? 'ফ্রি প্র্যাকটিস' : 'Custom'}</span>
                </button>

                <button
                  onClick={onOpenSmartDrill}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                  <span>{isBn ? 'অ্যানালাইজার' : 'Weak Keys'}</span>
                </button>

                <button
                  onClick={onOpenCertificate}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isBn ? 'সার্টিফিকেট' : 'Certificate'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
