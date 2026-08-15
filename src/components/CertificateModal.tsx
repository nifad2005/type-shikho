import React, { useState } from 'react';
import { Language, UserStats } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Printer, Download, CheckCircle2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  language: Language;
  onUpdateUserName: (name: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  userStats,
  language,
  onUpdateUserName,
}) => {
  const isBn = language === 'bn';
  const [name, setName] = useState<string>(userStats.userName || 'Master Typist');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    confetti({ particleCount: 50, spread: 60 });
    window.print();
  };

  const handleSaveName = () => {
    onUpdateUserName(name);
    setIsEditingName(false);
  };

  const completedLessonsList: { stars: number; accuracy: number; wpm: number; completedAt: string }[] = Object.values(userStats.completedLessons);
  const completedCount = completedLessonsList.length;
  const avgAccuracy =
    completedCount > 0
      ? Math.round(
          completedLessonsList.reduce((acc, curr) => acc + curr.accuracy, 0) /
            completedCount
        )
      : 98;

  const topWpm =
    completedCount > 0
      ? Math.max(...completedLessonsList.map((l) => l.wpm))
      : 35;

  const issueDate = new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8"
        >
          {/* Action Header */}
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBn ? 'টাইপিং একাডেমি অফিশিয়াল সার্টিফিকেট' : 'Official Touch Typing Diploma'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-print-certificate"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                {isBn ? 'প্রিন্ট / সেভ PDF' : 'Print / Save PDF'}
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1.5"
              >
                ✕
              </button>
            </div>
          </div>

          {/* PRINTABLE DIPLOMA CANVAS */}
          <div
            id="certificate-print-canvas"
            className="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-orange-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-4 sm:border-8 border-double border-amber-500/40 text-center shadow-lg overflow-hidden"
          >
            {/* Elegant Corner Ornaments */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600/60" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600/60" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600/60" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600/60" />

            {/* Emblem Seal */}
            <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-900 flex items-center justify-center shadow-md ring-4 ring-amber-400/30">
              <Award className="w-8 sm:w-10 h-8 sm:h-10 text-slate-950" />
            </div>

            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-teal-700 dark:text-teal-400 font-bold mb-1">
              TYPE SHIKHO TOUCH TYPING ACADEMY
            </p>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif tracking-tight mb-2">
              {isBn ? 'সনদপত্র / Certificate of Mastery' : 'Certificate of Mastery'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-6">
              {isBn
                ? 'এই মর্মে প্রত্যায়ন করা যাচ্ছে যে, নিচের শিক্ষার্থী শূন্য থেকে গাইডেড টাচ টাইপিং কোর্স ও হোম রো ডিসিপ্লিন সফলভাবে সম্পন্ন করেছেন।'
                : 'This is to certify that the student has successfully demonstrated muscle memory fluency, home row discipline, and accuracy mastery.'}
            </p>

            {/* Recipient Name Box */}
            <div className="max-w-md mx-auto my-4 pb-2 border-b-2 border-slate-300 dark:border-slate-700">
              {isEditingName ? (
                <div className="flex gap-2 justify-center">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-bold text-center text-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    placeholder="Enter your full name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingName(true)}
                  className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer flex items-center justify-center gap-2 group"
                  title="Click to edit name"
                >
                  <span>{name}</span>
                  <span className="text-xs font-sans text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    (✏️ {isBn ? 'নাম পরিবর্তন' : 'Edit'})
                  </span>
                </div>
              )}
            </div>

            {/* Performance Badges in Certificate */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto my-6 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{isBn ? 'গড় নির্ভুলতা' : 'Avg Accuracy'}</div>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{avgAccuracy}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{isBn ? 'শীর্ষ গতি' : 'Top Speed'}</div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{topWpm} WPM</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{isBn ? 'সম্পন্ন লেসন' : 'Completed'}</div>
                <div className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400">{completedCount} Lessons</div>
              </div>
            </div>

            {/* Signatures & Issue Date */}
            <div className="flex justify-between items-end max-w-lg mx-auto pt-6 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              <div className="text-left">
                <div className="font-serif italic font-bold text-slate-900 dark:text-slate-200 text-sm">Touch Typing Master</div>
                <div className="text-[10px] text-slate-400">Chief Instructor & Examiner</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-slate-900 dark:text-slate-200">{issueDate}</div>
                <div className="text-[10px] text-slate-400">Issued On / ভেরিফাইড আইডি: TS-{Date.now().toString().slice(-6)}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
