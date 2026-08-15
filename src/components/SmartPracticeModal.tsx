import React from 'react';
import { Language, UserStats, Lesson } from '../types';
import { generateSmartDrill, FINGER_COLORS, getKeyInfoForChar } from '../utils/keyboardMap';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Play, Sparkles, AlertTriangle, CheckCircle, Target, ArrowRight } from 'lucide-react';

interface SmartPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  language: Language;
  onStartCustomDrill: (lesson: Lesson) => void;
}

export const SmartPracticeModal: React.FC<SmartPracticeModalProps> = ({
  isOpen,
  onClose,
  userStats,
  language,
  onStartCustomDrill,
}) => {
  const isBn = language === 'bn';

  if (!isOpen) return null;

  // Extract top mistyped keys
  const sortedMistakes: [string, number][] = (Object.entries(userStats.keyMistakes) as [string, number][])
    .filter(([char, count]) => count > 0 && char.trim().length > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const hasMistakes = sortedMistakes.length > 0;
  const drillData = generateSmartDrill(userStats.keyMistakes);

  const handleLaunchDrill = () => {
    const customLesson: Lesson = {
      id: `smart-drill-${Date.now()}`,
      moduleId: 'smart-practice',
      titleEn: 'Personalized Muscle Memory Drill',
      titleBn: 'ব্যক্তিগত স্মার্ট দুর্বলতা নিরসন ড্রিল',
      descriptionEn: `Targeting your most frequent mistyped keys: ${drillData.targetedKeys.join(', ')}`,
      descriptionBn: `আপনার সবচেয়ে বেশি ভুল হওয়া অক্ষরসমূহ (${drillData.targetedKeys.join(', ')}) সমাধানের বিশেষ ড্রিল।`,
      keysIntroduced: drillData.targetedKeys,
      targetText: drillData.text,
      targetAccuracy: 95,
      xpReward: 120,
    };

    onStartCustomDrill(customLesson);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'স্মার্ট দুর্বলতা অ্যানালাইজার' : 'Smart Repetition Analyzer'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? 'আপনার বেশি ভুল হওয়া অক্ষরগুলো শনাক্ত করে কাস্টম ড্রিল তৈরি' : 'Auto-targets your most mistyped keys'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1.5"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div className="py-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {isBn ? 'চিহ্নিত দুর্বল অক্ষরসমূহ (Weak Keys)' : 'Identified Weak Keys'}
              </h3>

              {hasMistakes ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {sortedMistakes.map(([char, count]) => {
                    const keyInfo = getKeyInfoForChar(char);
                    const fingerData = FINGER_COLORS[keyInfo.finger];
                    return (
                      <div
                        key={char}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-rose-200 dark:border-rose-900/40 flex flex-col items-center justify-center text-center shadow-xs"
                      >
                        <span className="font-mono text-xl font-black text-rose-600 dark:text-rose-400">
                          {char === ' ' ? 'Space' : char.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {count} {isBn ? 'ভুল' : 'misses'}
                        </span>
                        <span className={`text-[8px] font-semibold mt-1 px-1.5 py-0.5 rounded-sm ${fingerData.lightBg}`}>
                          {keyInfo.finger.replace('left-', 'L-').replace('right-', 'R-')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    {isBn
                      ? 'দারুণ! এখনও পর্যন্ত আপনার কোনো স্থায়ী দুর্বল অক্ষর ধরা পড়েনি। অনুশীলনের পর এখানে দুর্বল অক্ষর স্বয়ংক্রিয়ভাবে জমা হবে।'
                      : 'Excellent! No prominent weak keys detected yet. As you practice, the system will auto-detect tricky keys here.'}
                  </p>
                </div>
              )}
            </div>

            {/* Generated Smart Drill Preview */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {isBn ? 'স্মার্ট ড্রিল প্রিভিউ:' : 'Generated Custom Drill Preview:'}
                </span>
                <span className="text-cyan-400 font-mono text-[10px]">
                  {drillData.targetedKeys.length} {isBn ? 'অক্ষর লক্ষ্য' : 'keys targeted'}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed max-h-20 overflow-y-auto pr-1">
                {drillData.text.slice(0, 120)}...
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              id="btn-launch-smart-drill"
              onClick={handleLaunchDrill}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {isBn ? 'এই কাস্টম ড্রিল শুরু করুন' : 'Launch Smart Practice Drill'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
