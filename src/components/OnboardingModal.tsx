import React, { useState } from 'react';
import { Language } from '../types';
import { BrandLogo } from './BrandLogo';
import { Sparkles, CheckCircle2, ChevronRight, Keyboard, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBeginner: () => void;
  language: Language;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartBeginner,
  language,
}) => {
  const [step, setStep] = useState<number>(1);
  const isBn = language === 'bn';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BrandLogo size={36} />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'স্বাগতম Type Shikho একাডেমিতে!' : 'Welcome to Type Shikho!'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? 'একদম শূন্য থেকে সঠিক পদ্ধতিতে টাইপিং শিখুন' : 'Guided touch typing from scratch'}
                </p>
              </div>
            </div>
            {/* Step indicator */}
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-emerald-500'
                      : s < step
                      ? 'w-2 bg-emerald-300 dark:bg-emerald-800'
                      : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Contents */}
          <div className="py-6 min-h-[260px] flex flex-col justify-center">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-center sm:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isBn ? 'গোল্ডেন রুল: কিবোর্ডের দিকে তাকানো যাবে না' : 'Golden Rule: Never Look Down at Keys'}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isBn ? 'আপনি কি একদম নতুন?' : 'Are you completely new to touch typing?'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isBn
                    ? 'টাইপিং কোনো চোখের খেলা নয়, এটি আঙুলের "পেশীর স্মৃতি" বা Muscle Memory-এর খেলা। আমরা আপনাকে স্পিডের তাড়াহুড়ো ছাড়াই ধাপে ধাপে প্রতিটি আঙুলের নিজস্ব এলাকা শেখাবো।'
                    : 'Touch typing is not about looking fast; it is about training unconscious finger muscle memory. Each finger has its own home anchor and color zone.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {isBn ? 'নির্ভুলতা আগে (Accuracy First)' : 'Accuracy First'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isBn ? 'শুরুতে গতির চেয়ে ৯৮%+ একুরেসি তৈরি করাই প্রধান লক্ষ্য।' : 'Speed naturally follows after mastering accuracy.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                    <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {isBn ? 'ভিজ্যুয়াল হ্যান্ড গাইড' : 'Live Visual Hands'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isBn ? 'স্ক্রিনের হাত দেখে বুঝবেন কোন আঙুলটা নাড়াতে হবে।' : 'Screen guides show you which finger to press.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  <Keyboard className="w-3.5 h-3.5" />
                  {isBn ? 'হোম রো পজিশন (Home Row Basics)' : 'Home Row Basics'}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isBn ? 'F এবং J কি-এর উঁচু দাগটি ছুঁয়ে দেখুন' : 'Feel the small bumps on F & J'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isBn
                    ? 'আপনার ফিজিক্যাল কিবোর্ডের F এবং J অক্ষরের ওপর হাত দিন। সেখানে ছোট একটি খাঁজ বা উঁচু দাগ অনুভব করবেন। এটিই হলো আপনার আঙুলের স্থায়ী ঠিকানা বা Home Base!'
                    : 'Every standard keyboard has raised tactile bumps on F and J. These are your blind anchor points.'}
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-slate-400">{isBn ? 'বাম হাত (Left Hand)' : 'Left Hand'}</div>
                    <div className="text-emerald-400 font-bold text-base tracking-widest">A - S - D - [ F ]</div>
                    <div className="text-[10px] text-slate-400">{isBn ? 'তর্জনী থাকবে F এ' : 'Index on F'}</div>
                  </div>

                  <div className="text-xs text-purple-400 font-semibold px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800">
                    {isBn ? 'দুই বুড়ো আঙুল: Spacebar' : 'Thumbs: Spacebar'}
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="text-xs text-slate-400">{isBn ? 'ডান হাত (Right Hand)' : 'Right Hand'}</div>
                    <div className="text-cyan-400 font-bold text-base tracking-widest">[ J ] - K - L - ;</div>
                    <div className="text-[10px] text-slate-400">{isBn ? 'তর্জনী থাকবে J এ' : 'Index on J'}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-center sm:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isBn ? 'আপনি প্রস্তুত!' : 'You are all set!'}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isBn ? 'চলুন লেভেল-১ (F ও J) দিয়ে শুরু করি!' : 'Let us begin Level 1: F & J Mastery!'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isBn
                    ? 'আমরা আপনাকে ধাপে ধাপে নিয়ে যাবো। ৯৫%+ নির্ভুল স্কোর করলেই পরের লেসন আনলক হবে। পুরো কোর্স শেষে আপনি পাবেন অফিশিয়াল সার্টিফিকেট ও ব্যাজ!'
                    : 'Complete each module with 95%+ accuracy to unlock new lessons, badges, and your final certified diploma.'}
                </p>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold">
                      {isBn ? 'টিপস:' : 'Pro Tip:'}
                    </span>{' '}
                    {isBn
                      ? 'টাইপ করার সময় নিজের হাতের দিকে না তাকিয়ে শুধু স্ক্রিনের ভার্চুয়াল হাত ও কিবোর্ডের দিকে তাকাবেন।'
                      : 'Never look at your physical hands. Trust the on-screen visual guide.'}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {step > 1 ? (
              <button
                id="btn-onboarding-prev"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {isBn ? 'পেছনে' : 'Previous'}
              </button>
            ) : (
              <button
                id="btn-onboarding-skip"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {isBn ? 'পরে দেখব' : 'Skip Intro'}
              </button>
            )}

            {step < 3 ? (
              <button
                id="btn-onboarding-next"
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md active:scale-95"
              >
                {isBn ? 'পরবর্তী' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-onboarding-start"
                onClick={() => {
                  onStartBeginner();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 animate-pulse"
              >
                {isBn ? 'হ্যাঁ, আমি একদম নতুন - শুরু করুন' : 'Start Level 1 Now'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
