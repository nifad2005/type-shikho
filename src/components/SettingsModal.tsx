import React, { useState } from 'react';
import { 
  Language, 
  SoundEffectType, 
  UserStats, 
  ThemeMode 
} from '../types';
import { 
  X, 
  Sun, 
  Moon, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playKeySound } from '../utils/audio';
import { testVoicePlayback, stopSpeaking, unlockAudioContext } from '../utils/speech';

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
  onOpenCurriculum?: () => void;
  onOpenCustomPractice?: () => void;
  onOpenSmartDrill?: () => void;
  onOpenCertificate?: () => void;
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
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const isBn = language === 'bn';
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  const soundOptions: { type: SoundEffectType; labelEn: string; labelBn: string }[] = [
    { type: 'mechanical', labelEn: 'Mechanical', labelBn: 'মেকানিক্যাল' },
    { type: 'typewriter', labelEn: 'Typewriter', labelBn: 'টাইপরাইটার' },
    { type: 'retro', labelEn: 'Retro', labelBn: 'রেট্রো' },
    { type: 'gentle', labelEn: 'Soft', labelBn: 'সফট' },
    { type: 'mute', labelEn: 'Mute', labelBn: 'মিউট' },
  ];

  const handleTestVoice = () => {
    if (isTestingVoice) {
      stopSpeaking();
      setIsTestingVoice(false);
      return;
    }
    unlockAudioContext();
    setIsTestingVoice(true);
    testVoicePlayback(language, () => {
      setIsTestingVoice(false);
    });
  };

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
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Subtle Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Minimal Settings Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-5 z-10 flex flex-col gap-4.5 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : isSepia
            ? 'bg-[#fbf7ee] border-[#dfcdb8] text-stone-800'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">
            {isBn ? 'সেটিংস' : 'Settings'}
          </h2>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reset feedback notification */}
        {resetSuccess && (
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2 font-medium">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{isBn ? 'সমস্ত অগ্রগতি মুছে ফেলা হয়েছে' : 'Progress reset successfully'}</span>
          </div>
        )}

        {/* Settings List */}
        <div className="flex flex-col gap-3.5 text-xs">
          {/* 1. Theme */}
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {isBn ? 'থিম' : 'Theme'}
            </span>
            <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 gap-0.5">
              <button
                id="btn-theme-dark"
                onClick={() => onThemeChange('dark')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer text-xs ${
                  theme === 'dark'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Moon className="w-3 h-3 text-blue-400" />
                <span>{isBn ? 'ডার্ক' : 'Dark'}</span>
              </button>
              <button
                id="btn-theme-light"
                onClick={() => onThemeChange('light')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer text-xs ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>{isBn ? 'লাইট' : 'Light'}</span>
              </button>
              <button
                id="btn-theme-sepia"
                onClick={() => onThemeChange('sepia')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer text-xs ${
                  theme === 'sepia'
                    ? 'bg-[#f4ede0] text-stone-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{isBn ? 'সেপিয়া' : 'Sepia'}</span>
              </button>
            </div>
          </div>

          {/* 2. Language */}
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {isBn ? 'ভাষা' : 'Language'}
            </span>
            <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 gap-0.5">
              <button
                id="btn-lang-bn"
                onClick={() => onLanguageChange('bn')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  language === 'bn'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                বাংলা
              </button>
              <button
                id="btn-lang-en"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  language === 'en'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* 3. Voice Instructor */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {isBn ? 'ভয়েস গাইড' : 'Voice Guide'}
              </span>
              {voiceEnabled && (
                <button
                  id="btn-test-voice-mini"
                  onClick={handleTestVoice}
                  title={isBn ? 'টেস্ট করুন' : 'Test Audio'}
                  className={`p-1 rounded-md text-xs transition-all cursor-pointer ${
                    isTestingVoice
                      ? 'text-amber-500 animate-pulse bg-amber-500/10'
                      : 'text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              id="btn-toggle-voice"
              onClick={onToggleVoice}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                voiceEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  voiceEnabled ? 'translate-x-4.5' : 'translate-x-0.75'
                }`}
              />
            </button>
          </div>

          {/* 4. Keystroke Sound */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
              <span>{isBn ? 'কীবোর্ড সাউন্ড' : 'Key Sound'}</span>
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {soundType}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {soundOptions.map((opt) => {
                const isSelected = soundType === opt.type;
                return (
                  <button
                    key={opt.type}
                    onClick={() => handleSelectSound(opt.type)}
                    className={`py-1 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isBn ? opt.labelBn : opt.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Reset Progress */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
            {!showConfirmReset ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {isBn ? 'অগ্রগতি রিসেট করুন' : 'Reset progress'}
                </span>
                <button
                  id="btn-open-reset-confirm"
                  onClick={() => setShowConfirmReset(true)}
                  className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] text-rose-500 font-medium leading-tight">
                  {isBn ? 'সব মুছবেন?' : 'Reset all data?'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-confirm-reset"
                    onClick={handleExecuteReset}
                    className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                  >
                    {isBn ? 'হ্যাঁ' : 'Yes'}
                  </button>
                  <button
                    id="btn-cancel-reset"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] cursor-pointer"
                  >
                    {isBn ? 'না' : 'No'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
