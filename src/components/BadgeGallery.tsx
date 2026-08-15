import React from 'react';
import { Badge, Language, UserStats } from '../types';
import { BADGES_DATA } from '../utils/keyboardMap';
import { 
  Sparkles, 
  Crown, 
  Target, 
  Compass, 
  Zap, 
  Flame, 
  Gamepad2, 
  Calendar, 
  Award, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';

interface BadgeGalleryProps {
  userStats: UserStats;
  language: Language;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
  Gamepad2: <Gamepad2 className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
};

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ userStats, language }) => {
  const isBn = language === 'bn';

  return (
    <div id="badge-gallery" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            {isBn ? 'অর্জন ও ব্যাজ গ্যালারি' : 'Achievements & Badges'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn ? 'টাইপিং দক্ষতা বাড়ানোর সাথে সাথে নতুন নতুন ব্যাজ আনলক করুন' : 'Unlock exclusive badges by mastering precision and daily streaks'}
          </p>
        </div>

        {/* Level & XP counter */}
        <div className="flex items-center gap-3 p-2 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 font-mono">
          <div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">{isBn ? 'লেভেল' : 'Level'}</div>
            <div className="text-xl font-black text-amber-900 dark:text-amber-200">{userStats.level}</div>
          </div>
          <div className="h-8 w-px bg-amber-200 dark:bg-amber-800" />
          <div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">{isBn ? 'মোট পয়েন্ট' : 'Total XP'}</div>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">{userStats.xp}</div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {BADGES_DATA.map((badge) => {
          const isUnlocked = userStats.unlockedBadges.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`relative p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {ICON_MAP[badge.icon] || <Award className="w-6 h-6" />}
                </div>

                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    {isBn ? 'অর্জিত' : 'Unlocked'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    {isBn ? 'লকড' : 'Locked'}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {isBn ? badge.titleBn : badge.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isBn ? badge.descriptionBn : badge.descriptionEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
