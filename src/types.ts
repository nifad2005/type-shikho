export type FingerId = 
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'left-thumb'
  | 'right-thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export type HandId = 'left' | 'right';

export type KeyFingerInfo = {
  key: string;
  display: string;
  finger: FingerId;
  hand: HandId;
  shiftRequired?: boolean;
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
  color: string;
};

export interface Lesson {
  id: string;
  moduleId: string;
  type?: 'typing' | 'game';
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  keysIntroduced: string[];
  targetText: string;
  targetAccuracy: number; // e.g. 95%
  minWpm?: number;
  xpReward: number;
}

export interface Module {
  id: string;
  number: number;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export interface UserStats {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessons: Record<string, { stars: number; accuracy: number; wpm: number; completedAt: string }>;
  unlockedModules: string[];
  totalKeysTyped: number;
  totalErrors: number;
  totalTimeSpentSeconds: number;
  keyMistakes: Record<string, number>; // character -> mistake count
  keyHits: Record<string, number>;
  unlockedBadges: string[];
  userName: string;
}

export interface Badge {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: string;
  category: 'accuracy' | 'streak' | 'completion' | 'speed' | 'game';
}

export type SoundEffectType = 'mechanical' | 'typewriter' | 'retro' | 'gentle' | 'mute';
export type Language = 'bn' | 'en';
export type ThemeMode = 'light' | 'dark' | 'sepia';
export type AppTab = 'learn' | 'game' | 'smart-practice' | 'badges' | 'certificate' | 'custom-test';
