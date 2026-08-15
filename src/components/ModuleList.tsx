import React from 'react';
import { Module, Lesson, Language, UserStats } from '../types';
import { MODULES_DATA } from '../utils/keyboardMap';
import { 
  Home, 
  ArrowUpDown, 
  ArrowBigUp, 
  Hash, 
  Flame, 
  Lock, 
  CheckCircle2, 
  Star, 
  Play, 
  Sparkles, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface ModuleListProps {
  userStats: UserStats;
  language: Language;
  onSelectLesson: (lesson: Lesson) => void;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  ArrowUpDown: <ArrowUpDown className="w-5 h-5" />,
  ArrowBigUp: <ArrowBigUp className="w-5 h-5" />,
  Hash: <Hash className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
};

export const ModuleList: React.FC<ModuleListProps> = ({
  userStats,
  language,
  onSelectLesson,
}) => {
  const isBn = language === 'bn';

  return (
    <div id="module-curriculum-list" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Intro Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-cyan-950/40 border border-emerald-200/70 dark:border-emerald-900/50 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            {isBn ? 'পদ্ধতিগত লার্নিং পাথ (Guided Progression)' : 'Structured Muscle Memory Journey'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'শূন্য থেকে টাচ টাইপিং পাঠ্যক্রম' : 'Touch Typing Curriculum'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            {isBn
              ? 'প্রতিটি লেসনে ৯৫%+ নির্ভুলতা অর্জন করে ধাপে ধাপে হোম রো থেকে পুরো কিবোর্ড আয়ত্ত করুন।'
              : 'Master each row step-by-step. Achieve 95%+ accuracy to unlock advanced modules.'}
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs font-mono">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">
              {isBn ? 'সম্পন্ন হয়েছে' : 'Progress'}
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {Object.keys(userStats.completedLessons).length} /{' '}
              {MODULES_DATA.reduce((acc, m) => acc + m.lessons.length, 0)} {isBn ? 'লেসন' : 'Lessons'}
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {MODULES_DATA.map((module, mIndex) => {
          // Check if module is unlocked (Module 1 is always unlocked; subsequent modules unlocked if previous completed or first lesson of module)
          const isModuleUnlocked =
            mIndex === 0 ||
            userStats.unlockedModules.includes(module.id) ||
            mIndex <= Math.floor(Object.keys(userStats.completedLessons).length / 3);

          const completedInModule = module.lessons.filter(
            (l) => userStats.completedLessons[l.id]
          ).length;
          const progressPercent = Math.round((completedInModule / module.lessons.length) * 100);

          return (
            <div
              key={module.id}
              className={`p-6 rounded-3xl border transition-all duration-200 ${
                isModuleUnlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-70'
              }`}
            >
              {/* Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                      isModuleUnlocked
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {MODULE_ICONS[module.icon] || <Home className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isBn ? module.titleBn : module.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? module.subtitleBn : module.subtitleEn}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="w-28 sm:w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Lessons Grid in this Module */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-5">
                {module.lessons.map((lesson, lIndex) => {
                  const completion = userStats.completedLessons[lesson.id];
                  const isLessonCompleted = !!completion;

                  // Lesson is unlocked if it's the first lesson, or if previous lesson in this module is completed, or if module unlocked
                  const isLessonUnlocked =
                    isModuleUnlocked &&
                    (lIndex === 0 ||
                      userStats.completedLessons[module.lessons[lIndex - 1].id] ||
                      isLessonCompleted);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => isLessonUnlocked && onSelectLesson(lesson)}
                      className={`p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                        isLessonUnlocked
                          ? isLessonCompleted
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400 cursor-pointer shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md cursor-pointer'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isLessonCompleted
                              ? 'bg-emerald-500 text-white'
                              : isLessonUnlocked
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isLessonCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isLessonUnlocked ? (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {isBn ? lesson.titleBn : lesson.titleEn}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {lesson.keysIntroduced.slice(0, 4).map((k) => (
                              <span
                                key={k}
                                className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              >
                                {k === ' ' ? 'Space' : k}
                              </span>
                            ))}
                            {lesson.keysIntroduced.length > 4 && (
                              <span className="text-[10px] text-slate-400">+{lesson.keysIntroduced.length - 4}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Stars or Start Arrow */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isLessonCompleted ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= (completion?.stars || 1)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        ) : isLessonUnlocked ? (
                          <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-emerald-500 transition-colors">
                            {isBn ? 'শুরু' : 'Start'}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            {isBn ? 'লকড' : 'Locked'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
