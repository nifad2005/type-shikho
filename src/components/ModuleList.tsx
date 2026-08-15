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
  X,
  Gamepad2,
  ChevronRight
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

  const totalLessons = MODULES_DATA.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = Object.keys(userStats.completedLessons).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'টাচ টাইপিং পাঠ্যক্রম রোডম্যাপ' : 'Touch Typing Curriculum'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn 
                ? `সম্পন্ন হয়েছে ${completedCount}/${totalLessons} টি লেসন` 
                : `${completedCount} of ${totalLessons} Lessons Completed`}
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

        {/* Modules Accordion / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {MODULES_DATA.map((module, mIndex) => {
            const isModuleUnlocked =
              mIndex === 0 ||
              userStats.unlockedModules.includes(module.id) ||
              mIndex <= Math.floor(completedCount / 3);

            const completedInModule = module.lessons.filter(
              (l) => userStats.completedLessons[l.id]
            ).length;

            return (
              <div
                key={module.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isModuleUnlocked
                    ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-100/40 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 opacity-60'
                }`}
              >
                {/* Module Title */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      {MODULE_ICONS[module.icon] || <Home className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {isBn ? module.titleBn : module.titleEn}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {completedInModule}/{module.lessons.length}
                  </span>
                </div>

                {/* Lessons in Module */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {module.lessons.map((lesson, lIndex) => {
                    const completion = userStats.completedLessons[lesson.id];
                    const isLessonCompleted = !!completion;
                    const isCurrent = lesson.id === currentLessonId;

                    const isLessonUnlocked =
                      isModuleUnlocked &&
                      (lIndex === 0 ||
                        userStats.completedLessons[module.lessons[lIndex - 1].id] ||
                        isLessonCompleted);

                    const isGame = lesson.type === 'game';

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (isLessonUnlocked) {
                            onSelectLesson(lesson);
                            if (onClose) onClose();
                          }
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          isCurrent
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-100'
                            : isLessonUnlocked
                            ? isGame
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-500 cursor-pointer'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-500 cursor-pointer'
                            : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isLessonCompleted
                                ? 'bg-teal-500 text-white'
                                : isGame
                                ? 'bg-amber-500 text-white'
                                : isLessonUnlocked
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isLessonCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : isGame ? (
                              <Gamepad2 className="w-3.5 h-3.5" />
                            ) : isLessonUnlocked ? (
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                          </div>

                          <span className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
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
                          ) : isLessonUnlocked ? (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          ) : null}
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
