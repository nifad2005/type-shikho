import React, { useState } from 'react';
import { Language, SoundEffectType, UserStats, Lesson } from '../types';
import { 
  Keyboard, 
  Volume2, 
  VolumeX, 
  Globe, 
  BookOpen, 
  Award, 
  BrainCircuit, 
  FileText, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Gamepad2
} from 'lucide-react';

interface HeaderProps {
  currentLesson: Lesson | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  soundType: SoundEffectType;
  onToggleSound: () => void;
  userStats: UserStats;
  onOpenCurriculum: () => void;
  onOpenCustomPractice: () => void;
  onOpenSmartDrill: () => void;
  onOpenCertificate: () => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLesson,
  language,
  onLanguageChange,
  soundType,
  onToggleSound,
  userStats,
  onOpenCurriculum,
  onOpenCustomPractice,
  onOpenSmartDrill,
  onOpenCertificate,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson,
}) => {
  const isBn = language === 'bn';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Clean Brand */}
        <div 
          onClick={onOpenCurriculum}
          className="flex items-center gap-2 cursor-pointer select-none group"
          title={isBn ? 'পাঠ্যক্রম ম্যাপ দেখুন' : 'View Curriculum'}
        >
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-500 transition-colors">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              TypeMaster
            </span>
          </div>
        </div>

        {/* Center: Minimalist Lesson Navigator */}
        {currentLesson && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl">
            <button
              id="nav-prev-lesson"
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              title={isBn ? 'পূর্ববর্তী লেসন' : 'Previous Lesson'}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-current-lesson-dropdown"
              onClick={onOpenCurriculum}
              className="px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 transition-colors cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
            >
              {currentLesson.type === 'game' ? (
                <Gamepad2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              )}
              <span className="truncate">
                {isBn ? currentLesson.titleBn : currentLesson.titleEn}
              </span>
            </button>

            <button
              id="nav-next-lesson"
              onClick={onNextLesson}
              disabled={!hasNextLesson}
              title={isBn ? 'পরবর্তী লেসন' : 'Next Lesson'}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle (1 click) */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            title={soundType === 'mute' ? (isBn ? 'সাউন্ড অন করুন' : 'Unmute') : (isBn ? 'সাউন্ড মিউট করুন' : 'Mute')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {soundType === 'mute' ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            )}
          </button>

          {/* Language Switch */}
          <button
            id="btn-lang-toggle"
            onClick={() => onLanguageChange(language === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
            title="বাংলা / English"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* All Lessons Curriculum Roadmap Button */}
          <button
            id="btn-open-curriculum"
            onClick={onOpenCurriculum}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-bold transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isBn ? 'সকল লেসন' : 'Curriculum'}</span>
          </button>

          {/* Extra Options Menu (Dropdown) */}
          <div className="relative">
            <button
              id="btn-more-options"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isBn ? 'অতিরিক্ত অপশন' : 'More Options'}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {isMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 flex flex-col gap-1 text-xs font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                <button
                  onClick={onOpenCurriculum}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>{isBn ? 'লেসন পাঠ্যক্রম' : 'Lesson Curriculum'}</span>
                </button>

                <button
                  onClick={onOpenCustomPractice}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{isBn ? 'ফ্রি প্র্যাকটিস' : 'Free Practice'}</span>
                </button>

                <button
                  onClick={onOpenSmartDrill}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  <span>{isBn ? 'দুর্বল কি অ্যানালাইজার' : 'Weak Key Analyzer'}</span>
                </button>

                <button
                  onClick={onOpenCertificate}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-500" />
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
