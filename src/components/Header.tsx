import React from 'react';
import { AppTab, Language, SoundEffectType, UserStats } from '../types';
import { 
  Keyboard, 
  Gamepad2, 
  Award, 
  BrainCircuit, 
  FileText, 
  Volume2, 
  VolumeX, 
  Flame, 
  Globe, 
  HelpCircle, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  soundType: SoundEffectType;
  onSoundChange: (sound: SoundEffectType) => void;
  userStats: UserStats;
  onOpenOnboarding: () => void;
  onOpenSmartModal: () => void;
  onOpenCertificate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  soundType,
  onSoundChange,
  userStats,
  onOpenOnboarding,
  onOpenSmartModal,
  onOpenCertificate,
}) => {
  const isBn = language === 'bn';

  const navTabs: { id: AppTab; labelBn: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'learn', labelBn: 'মডিউল পাঠ্যক্রম', labelEn: 'Curriculum', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'game', labelBn: 'শব্দ বৃষ্টি গেম', labelEn: 'Sky Fall Game', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'custom-test', labelBn: 'ফ্রি প্র্যাকটিস', labelEn: 'Free Practice', icon: <FileText className="w-4 h-4" /> },
    { id: 'badges', labelBn: 'ব্যাজ ও অর্জন', labelEn: 'Badges', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="w-full bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Stats */}
        <div className="w-full md:w-auto flex items-center justify-between gap-3">
          <div
            onClick={() => onTabChange('learn')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  TypeMaster
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {isBn ? 'একাডেমি' : 'Academy'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                {isBn ? 'শূন্য থেকে নির্ভুল টাচ টাইপিং' : 'Guided Muscle Memory Touch Typing'}
              </p>
            </div>
          </div>

          {/* Quick Stats on Mobile/Top Bar */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Daily Streak */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold"
              title={isBn ? `${userStats.streakDays} দিন নিয়মিত অনুশীলন` : `${userStats.streakDays} Days Daily Streak`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{userStats.streakDays}</span>
            </div>

            {/* Level & XP */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 font-bold cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => onTabChange('badges')}
              title={isBn ? 'লেভেল ও অর্জিত পয়েন্ট' : 'XP & Level'}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Lv.{userStats.level}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto max-w-full">
          {navTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Smart Drill, Certificate, Sound, Lang, Onboarding */}
        <div className="flex items-center gap-2">
          {/* Smart Repetition Weak Key Button */}
          <button
            id="btn-open-smart-drill"
            onClick={onOpenSmartModal}
            title={isBn ? 'স্মার্ট দুর্বলতা অ্যানালাইজার' : 'Smart Weak Key Analyzer'}
            className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 transition-all flex items-center gap-1 text-xs font-bold"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden lg:inline">{isBn ? 'স্মার্ট ড্রিল' : 'Smart Drill'}</span>
          </button>

          {/* Certificate Diploma button */}
          <button
            id="btn-open-certificate"
            onClick={onOpenCertificate}
            title={isBn ? 'সার্টিফিকেট দেখুন' : 'View Certificate'}
            className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-all flex items-center gap-1 text-xs font-bold"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span className="hidden lg:inline">{isBn ? 'সার্টিফিকেট' : 'Certificate'}</span>
          </button>

          {/* Sound Switcher */}
          <div className="relative group">
            <button
              title={isBn ? `সাউন্ড মোড: ${soundType}` : `Sound: ${soundType}`}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all"
            >
              {soundType === 'mute' ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col gap-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 text-xs min-w-[130px]">
              {(['mechanical', 'typewriter', 'retro', 'gentle', 'mute'] as SoundEffectType[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onSoundChange(st)}
                  className={`px-2.5 py-1.5 rounded-lg text-left capitalize font-semibold transition-colors ${
                    soundType === st
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Language Switcher */}
          <button
            id="btn-language-toggle"
            onClick={() => onLanguageChange(language === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Switch Language / ভাষা পরিবর্তন"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* Tutorial / Help Icon */}
          <button
            id="btn-open-tutorial"
            onClick={onOpenOnboarding}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            title={isBn ? 'টিউটোরিয়াল ও গাইড' : 'Interactive Tutorial'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
