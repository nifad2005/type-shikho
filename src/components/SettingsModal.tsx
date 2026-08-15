import React, { useState } from 'react';
import { 
  Language, 
  SoundEffectType, 
  UserStats, 
  ThemeMode 
} from '../types';
import { 
  Settings, 
  X, 
  Sun, 
  Moon, 
  Sparkles, 
  Headphones, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Trash2, 
  AlertTriangle, 
  Check, 
  BookOpen, 
  FileText, 
  BrainCircuit, 
  Award,
  RotateCcw,
  Sliders,
  Volume1
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playKeySound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  soundType: SoundEffectType;
  onSoundTypeChange: (type: SoundEffectType) => void;
  userStats: UserStats;
  onResetProgress: () => void;
  onOpenCurriculum: () => void;
  onOpenCustomPractice: () => void;
  onOpenSmartDrill: () => void;
  onOpenCertificate: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  voiceEnabled,
  onToggleVoice,
  soundType,
  onSoundTypeChange,
  userStats,
  onResetProgress,
  onOpenCurriculum,
  onOpenCustomPractice,
  onOpenSmartDrill,
  onOpenCertificate,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isBn = language === 'bn';
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  const completedCount = Object.keys(userStats.completedLessons).length;

  const soundOptions: { type: SoundEffectType; labelEn: string; labelBn: string; descEn: string; descBn: string }[] = [
    { type: 'mechanical', labelEn: 'Mechanical', labelBn: 'মেকানিক্যাল', descEn: 'Tactile blue switch click', descBn: 'ক্ল্যাকি কিবোর্ড সাউন্ড' },
    { type: 'typewriter', labelEn: 'Typewriter', labelBn: 'টাইপরাইটার', descEn: 'Classic bell & clack', descBn: 'ভিন্টেজ ধাতব শব্দ' },
    { type: 'retro', labelEn: 'Retro Beep', labelBn: 'রেট্রো বিপ', descEn: '8-bit arcade key beep', descBn: 'আর্কেড গেম সাউন্ড' },
    { type: 'gentle', labelEn: 'Soft Click', labelBn: 'নরম ক্লিক', descEn: 'Subtle low-frequency click', descBn: 'শান্ত ও কোমল ক্লিক' },
    { type: 'mute', labelEn: 'Mute', labelBn: 'নিঃশব্দ', descEn: 'Silent typing', descBn: 'কোনো শব্দ হবে না' },
  ];

  const handleSelectSound = (type: SoundEffectType) => {
    onSoundTypeChange(type);
    if (type !== 'mute') {
      playKeySound(type, false);
    }
  };

  const handleExecuteReset = () => {
    onResetProgress();
    setShowConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden z-10 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : isSepia
            ? 'bg-[#fbf7ee] border-[#dfcdb8] text-stone-800'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Modal Top Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/90' : isSepia ? 'border-[#e6d8c3] bg-[#f5ecdd]' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isBn ? 'সেটিংস ও নিয়ন্ত্রণ কেন্দ্র' : 'Settings & Preferences'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? 'ভাষা, থিম, অডিও ও অগ্রগতির যাবতীয় অপশন' : 'Customize interface, audio, and learning data'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs">
          
          {/* Success Banner if reset done */}
          <AnimatePresence>
            {resetSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{isBn ? 'আপনার সমস্ত অগ্রগতি সফলভাবে রিসেট করা হয়েছে।' : 'All progress has been successfully reset.'}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: Appearance & Language */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <span>{isBn ? 'ইন্টারফেস ও ভাষা' : 'Appearance & Language'}</span>
            </div>

            {/* Language Selection */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-850/50' : isSepia ? 'border-[#e6d8c3] bg-[#f8f1e5]' : 'border-slate-100 bg-slate-50/60'
            }`}>
              <div>
                <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                  {isBn ? 'ভাষার মাধ্যম (Language)' : 'Interface Language'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn ? 'ইন্টারফেসের সমস্ত টেক্সট ও নির্দেশনা' : 'Bengali or English system text'}
                </span>
              </div>
              <div className="flex items-center rounded-xl p-1 bg-slate-200/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1">
                <button
                  id="btn-set-lang-bn"
                  onClick={() => onLanguageChange('bn')}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    language === 'bn'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  id="btn-set-lang-en"
                  onClick={() => onLanguageChange('en')}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
              isDark ? 'border-slate-800 bg-slate-850/50' : isSepia ? 'border-[#e6d8c3] bg-[#f8f1e5]' : 'border-slate-100 bg-slate-50/60'
            }`}>
              <div>
                <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                  {isBn ? 'ভিজ্যুয়াল কালার থিম' : 'Color Palette'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn ? 'আপনার চোখের জন্য স্বস্তিদায়ক ডিসপ্লে' : 'Choose a comfortable reading theme'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Light */}
                <button
                  id="btn-theme-light"
                  onClick={() => onThemeChange('light')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 border-teal-600 shadow-sm ring-1 ring-teal-600'
                      : 'bg-white/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-500' : 'opacity-70'}`} />
                  <span className="font-semibold text-[11px]">{isBn ? 'লাইট' : 'Light'}</span>
                </button>

                {/* Dark */}
                <button
                  id="btn-theme-dark"
                  onClick={() => onThemeChange('dark')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-950 text-white border-teal-500 shadow-sm ring-1 ring-teal-500'
                      : 'bg-white/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'opacity-70'}`} />
                  <span className="font-semibold text-[11px]">{isBn ? 'ডার্ক' : 'Dark'}</span>
                </button>

                {/* Sepia */}
                <button
                  id="btn-theme-sepia"
                  onClick={() => onThemeChange('sepia')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'sepia'
                      ? 'bg-[#f4ede0] text-stone-900 border-amber-600 shadow-sm ring-1 ring-amber-600'
                      : 'bg-white/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${theme === 'sepia' ? 'text-amber-600' : 'opacity-70'}`} />
                  <span className="font-semibold text-[11px]">{isBn ? 'সেপিয়া' : 'Sepia'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Audio, Voice & Sound Effects */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <span>{isBn ? 'শব্দ ও অডিও গাইড' : 'Audio & Keystroke Sound'}</span>
            </div>

            {/* Voice Instructor Toggle */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-850/50' : isSepia ? 'border-[#e6d8c3] bg-[#f8f1e5]' : 'border-slate-100 bg-slate-50/60'
            }`}>
              <div className="pr-3">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                  <Headphones className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isBn ? 'বাংলা ভয়েস শিক্ষক গাইড' : 'Bangla Voice Instructor'}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBn ? 'প্রতিটি লেসনের শুরুতে বাংলা অডিও নির্দেশিকা প্রদান করবে' : 'Narrates instructional tips before each drill'}
                </p>
              </div>

              <button
                id="btn-toggle-voice-settings"
                onClick={onToggleVoice}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                  voiceEnabled
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {voiceEnabled ? <Check className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{voiceEnabled ? (isBn ? 'চালু' : 'Enabled') : (isBn ? 'বন্ধ' : 'Off')}</span>
              </button>
            </div>

            {/* Keystroke Sound Styles */}
            <div className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
              isDark ? 'border-slate-800 bg-slate-850/50' : isSepia ? 'border-[#e6d8c3] bg-[#f8f1e5]' : 'border-slate-100 bg-slate-50/60'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                    {isBn ? 'কীবোর্ড টাইপিং সাউন্ড স্টাইল' : 'Keystroke Sound Profile'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn ? 'ক্লিক করে সরাসরি সাউন্ড প্রিভিউ শুনুন' : 'Click to preview audio feedback'}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400">
                  {soundType}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {soundOptions.map((opt) => {
                  const isSelected = soundType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => handleSelectSound(opt.type)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600/10 border-teal-600 text-teal-700 dark:text-teal-300 ring-1 ring-teal-600'
                          : isDark
                          ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {opt.type === 'mute' ? (
                          <VolumeX className="w-3.5 h-3.5 opacity-60" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        )}
                        <div>
                          <div className="font-bold text-xs">{isBn ? opt.labelBn : opt.labelEn}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{isBn ? opt.descBn : opt.descEn}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Navigation & Tools */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <span>{isBn ? 'দ্রুত নেভিগেশন ও পেইজ' : 'Pages & Fast Navigation'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenCurriculum();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isDark ? 'border-slate-800 bg-slate-850/50 hover:bg-slate-800' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{isBn ? 'সম্পূর্ণ পাঠ্যক্রম' : 'Curriculum'}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{isBn ? 'মডিউল ও লেসন সমূহ' : 'All lesson modules'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenCustomPractice();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isDark ? 'border-slate-800 bg-slate-850/50 hover:bg-slate-800' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{isBn ? 'ফ্রি প্র্যাকটিস' : 'Custom Practice'}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{isBn ? 'নিজস্ব টেক্সট টাইপিং' : 'Custom text typing'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenSmartDrill();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isDark ? 'border-slate-800 bg-slate-850/50 hover:bg-slate-800' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{isBn ? 'দুর্বল কী অ্যানালাইজার' : 'Weak Keys'}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{isBn ? 'ভুল কী সনাক্তকরণ' : 'Targeted error drills'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenCertificate();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isDark ? 'border-slate-800 bg-slate-850/50 hover:bg-slate-800' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{isBn ? 'সার্টিফিকেট' : 'Certificate'}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{isBn ? 'টাইপিং সনদপত্র' : 'Course diploma'}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 4: Danger Zone / Reset All Progress */}
          <div className="pt-2">
            <div className={`p-4 rounded-xl border transition-all ${
              showConfirmReset
                ? 'border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20'
                : isDark
                ? 'border-slate-800 bg-slate-900/60'
                : 'border-slate-200 bg-slate-50/80'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-600 dark:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                    <span>{isBn ? 'অগ্রগতি ও রেকর্ড রিসেট' : 'Reset All Progress'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {isBn 
                      ? `বর্তমান লেভেল: ${userStats.level}, সমাপ্ত লেসন: ${completedCount} টি, অর্জিত মোট XP: ${userStats.xp}। এটি সম্পূর্ণ রিসেট করে শুরু থেকে শুরু করবে।`
                      : `Current Level: ${userStats.level}, Completed: ${completedCount} lessons, XP: ${userStats.xp}. Wipes all stored history and restarts from Lesson 1.`
                    }
                  </p>
                </div>

                {!showConfirmReset && (
                  <button
                    id="btn-trigger-reset-progress"
                    onClick={() => setShowConfirmReset(true)}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs shrink-0 transition-colors cursor-pointer"
                  >
                    {isBn ? 'রিসেট করুন' : 'Reset Data'}
                  </button>
                )}
              </div>

              {/* Confirmation state */}
              {showConfirmReset && (
                <div className="mt-3 pt-3 border-t border-rose-500/20 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isBn 
                        ? 'আপনি কি নিশ্চিত? সমস্ত লেসনের রেকর্ড ও XP চিরতরে মুছে যাবে।' 
                        : 'Are you sure? All completed lessons, badges and XP will be cleared.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      id="btn-confirm-reset-progress"
                      onClick={handleExecuteReset}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'হ্যাঁ, সব মুছে ফেলুন' : 'Yes, Wipe Everything'}</span>
                    </button>
                    <button
                      id="btn-cancel-reset-progress"
                      onClick={() => setShowConfirmReset(false)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/90' : isSepia ? 'border-[#e6d8c3] bg-[#f5ecdd]' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <span>Type Shikho Academy v1.2</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            {isBn ? 'সম্পন্ন' : 'Done'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
