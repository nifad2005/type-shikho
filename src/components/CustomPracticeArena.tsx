import React, { useState } from 'react';
import { Language, SoundEffectType, UserStats, Lesson } from '../types';
import { TypingArena } from './TypingArena';
import { Sparkles, FileText, Code2, BookOpen, PenTool, CheckCircle } from 'lucide-react';

interface CustomPracticeArenaProps {
  language: Language;
  soundType: SoundEffectType;
  userStats: UserStats;
  onLessonComplete: (result: { lessonId: string; accuracy: number; wpm: number; stars: number; mistakes: Record<string, number> }) => void;
}

const PRESET_PASSAGES = [
  {
    id: 'p-coding',
    titleEn: 'JavaScript & Web Dev Syntax',
    titleBn: 'জাভাস্ক্রিপ্ট ও কোডিং সিনট্যাক্স',
    icon: 'Code2',
    text: 'const user = { name: "Alice", active: true, score: 98 }; function calculateWpm(words, time) { return words / time; }',
  },
  {
    id: 'p-literature',
    titleEn: 'Inspirational Discipline & Focus',
    titleBn: 'একাগ্রতা ও অনুপ্রেরণা',
    icon: 'BookOpen',
    text: 'Small daily improvements over time lead to stunning results. Keep your fingers on the home row, stay relaxed, and let muscle memory guide every keystroke effortlessly.',
  },
  {
    id: 'p-quick-speed',
    titleEn: 'Pangram Speed Drill',
    titleBn: 'দ্রুত প্যানগ্রাম স্পিড ড্রিল',
    icon: 'Sparkles',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How razorback-jumping frogs can level six piqued jockeys!',
  },
];

export const CustomPracticeArena: React.FC<CustomPracticeArenaProps> = ({
  language,
  soundType,
  userStats,
  onLessonComplete,
}) => {
  const isBn = language === 'bn';
  const [customText, setCustomText] = useState<string>('');
  const [activeCustomLesson, setActiveCustomLesson] = useState<Lesson | null>(null);

  const handleStartPreset = (p: typeof PRESET_PASSAGES[0]) => {
    const lesson: Lesson = {
      id: `custom-${p.id}`,
      moduleId: 'custom',
      titleEn: p.titleEn,
      titleBn: p.titleBn,
      descriptionEn: 'Custom practice mode',
      descriptionBn: 'কাস্টম অনুশীলন মোড',
      keysIntroduced: ['Custom'],
      targetText: p.text,
      targetAccuracy: 95,
      xpReward: 100,
    };
    setActiveCustomLesson(lesson);
  };

  const handleStartCustomInput = () => {
    if (!customText.trim()) return;
    const cleanText = customText.trim().replace(/\s+/g, ' ');
    const lesson: Lesson = {
      id: `user-custom-${Date.now()}`,
      moduleId: 'custom',
      titleEn: 'User Custom Text Drill',
      titleBn: 'ব্যবহারকারীর নিজস্ব টেক্সট অনুশীলন',
      descriptionEn: 'Practice your own pasted text',
      descriptionBn: 'আপনার দেওয়া টেক্সটের ওপর অনুশীলন',
      keysIntroduced: ['Custom'],
      targetText: cleanText,
      targetAccuracy: 95,
      xpReward: 100,
    };
    setActiveCustomLesson(lesson);
  };

  if (activeCustomLesson) {
    return (
      <div className="w-full flex flex-col items-center gap-4">
        <button
          onClick={() => setActiveCustomLesson(null)}
          className="self-start text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
        >
          ← {isBn ? 'কাস্টম অপশন নির্বাচন পেজে ফিরে যান' : 'Back to Custom Text Selection'}
        </button>
        <TypingArena
          lesson={activeCustomLesson}
          language={language}
          soundType={soundType}
          userStats={userStats}
          onLessonComplete={onLessonComplete}
        />
      </div>
    );
  }

  return (
    <div id="custom-practice-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-500" />
          {isBn ? 'ফ্রি প্র্যাকটিস ও নিজস্ব টেক্সট মোড' : 'Free Practice & Custom Text Mode'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isBn
            ? 'যেকোনো কোড সিনট্যাক্স, অনুচ্ছেদ বা নিজস্ব টেক্সট পেস্ট করে টাইপিং স্পিড পরীক্ষা করুন'
            : 'Practice custom paragraphs, programming syntax, or paste your own study materials'}
        </p>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_PASSAGES.map((preset) => (
          <div
            key={preset.id}
            onClick={() => handleStartPreset(preset)}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {isBn ? preset.titleBn : preset.titleEn}
              </h3>
              <p className="text-xs text-slate-400 font-mono line-clamp-3 leading-relaxed">
                "{preset.text}"
              </p>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors">
              {isBn ? 'অনুশীলন শুরু করুন' : 'Start Drill'}
            </button>
          </div>
        ))}
      </div>

      {/* Custom Text Area Input */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PenTool className="w-4 h-4 text-emerald-500" />
          {isBn ? 'আপনার নিজস্ব টেক্সট পেস্ট করুন' : 'Paste Your Own Custom Text'}
        </h3>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={
            isBn
              ? 'এখানে আপনার ইচ্ছেমতো ইংরেজি টেক্সট, কোড বা প্যারাগ্রাফ পেস্ট করুন...'
              : 'Paste your custom English paragraph, essay, or code snippet here to practice...'
          }
          className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">
            {customText.length} {isBn ? 'অক্ষর' : 'characters'}
          </span>
          <button
            id="btn-start-custom-text"
            onClick={handleStartCustomInput}
            disabled={!customText.trim()}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            {isBn ? 'কাস্টম টেক্সট শুরু করুন' : 'Start Custom Practice'}
          </button>
        </div>
      </div>
    </div>
  );
};
