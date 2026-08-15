import React, { useState } from 'react';
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
  X,
  Gamepad2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface ModuleListProps {
  userStats: UserStats;
  language: Language;
  currentLessonId?: string;
  onSelectLesson: (lesson: Lesson) => void;
  onClose?: () => void;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4" />,
  ArrowUpDown: <ArrowUpDown className="w-4 h-4" />,
  ArrowBigUp: <ArrowBigUp className="w-4 h-4" />,
  Hash: <Hash className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
};

export const ModuleList: React.FC<ModuleListProps> = ({
  userStats,
  language,
  currentLessonId,
  onSelectLesson,
  onClose,
}) => {
  const isBn = language === 'bn';
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Flatten all lessons sequentially to determine strict unlock sequence
  const allLessons: Lesson[] = React.useMemo(() => {
    return MODULES_DATA.flatMap((m) => m.lessons);
  }, []);

  // Helper to determine if a lesson is strictly unlocked
  const isLessonUnlocked = (lesson: Lesson): boolean => {
    const index = allLessons.findIndex((l) => l.id === lesson.id);
    if (index === 0) return true; // first lesson is always unlocked
    
    // Check if the preceding lesson was completed with passing score (accuracy >= 90 or stars >= 1)
    const prevLesson = allLessons[index - 1];
    const prevCompletion = userStats.completedLessons[prevLesson.id];
    return !!prevCompletion && (prevCompletion.accuracy >= 90 || prevCompletion.stars >= 1);
  };

  const totalLessons = allLessons.length;
  const completedCount = Object.values(userStats.completedLessons).filter(
    (c: { accuracy: number; stars: number }) => c.accuracy >= 90 || c.stars >= 1
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'টাচ টাইপিং পাঠ্যক্রম রোডম্যাপ' : 'Touch Typing Curriculum'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn 
                ? `সম্পন্ন হয়েছে ${completedCount}/${totalLessons} টি লেসন (লক খুলতে ৯০%+ স্কোর প্রয়োজন)` 
                : `${completedCount} of ${totalLessons} Lessons Completed (90%+ to unlock next)`}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Lock warning toast */}
        {lockedNotice && (
          <div className="mx-4 mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{lockedNotice}</span>
          </div>
        )}

        {/* Modules Accordion / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {MODULES_DATA.map((module) => {
            const isModuleStarted = module.lessons.some((l) => isLessonUnlocked(l));
            const completedInModule = module.lessons.filter((l) => {
              const comp = userStats.completedLessons[l.id];
              return comp && (comp.accuracy >= 90 || comp.stars >= 1);
            }).length;

            return (
              <div
                key={module.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isModuleStarted
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-100/30 dark:bg-slate-900/20 border-slate-200/30 dark:border-slate-800/30 opacity-60'
                }`}
              >
                {/* Module Title */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isModuleStarted
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {MODULE_ICONS[module.icon] || <Home className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {isBn ? module.titleBn : module.titleEn}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {isBn ? module.subtitleBn : module.subtitleEn}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {completedInModule}/{module.lessons.length}
                  </span>
                </div>

                {/* Lessons in Module */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {module.lessons.map((lesson) => {
                    const completion = userStats.completedLessons[lesson.id];
                    const isLessonCompleted = !!completion && (completion.accuracy >= 90 || completion.stars >= 1);
                    const isCurrent = lesson.id === currentLessonId;
                    const unlocked = isLessonUnlocked(lesson);
                    const isGame = lesson.type === 'game';

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (unlocked) {
                            onSelectLesson(lesson);
                            if (onClose) onClose();
                          } else {
                            setLockedNotice(
                              isBn
                                ? `"${lesson.titleBn}" লক করা আছে। আগের লেসনে অন্তত ৯০%+ একুরেসি পেয়ে পাস করুন।`
                                : `"${lesson.titleEn}" is locked. Complete the preceding lesson with 90%+ accuracy first.`
                            );
                            setTimeout(() => setLockedNotice(null), 3500);
                          }
                        }}
                        title={
                          !unlocked
                            ? (isBn ? 'লক করা আছে (আগের লেসন সম্পন্ন করুন)' : 'Locked (Complete previous lesson)')
                            : ''
                        }
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${
                          isCurrent
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-100 ring-2 ring-teal-500/20'
                            : unlocked
                            ? isGame
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-500 cursor-pointer shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-500 cursor-pointer shadow-xs'
                            : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isLessonCompleted
                                ? 'bg-teal-500 text-white'
                                : isGame && unlocked
                                ? 'bg-amber-500 text-white'
                                : unlocked
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isLessonCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : isGame ? (
                              <Gamepad2 className="w-3.5 h-3.5" />
                            ) : unlocked ? (
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>

                          <span className={`text-xs font-semibold truncate ${
                            unlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                          }`}>
                            {isBn ? lesson.titleBn : lesson.titleEn}
                          </span>
                        </div>

                        {/* Right: Stars or status */}
                        <div className="shrink-0 flex items-center">
                          {isLessonCompleted ? (
                            <div className="flex items-center">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-3 h-3 ${
                                    starIdx <= (completion?.stars || 1)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-200 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : unlocked ? (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-400" />
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
    </div>
  );
};
