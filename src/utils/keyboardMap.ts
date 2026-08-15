import { FingerId, KeyFingerInfo, Module, Badge } from '../types';

export const FINGER_COLORS: Record<FingerId, { bg: string; border: string; text: string; lightBg: string; nameEn: string; nameBn: string }> = {
  'left-pinky': {
    bg: 'bg-rose-500',
    border: 'border-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    lightBg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    nameEn: 'Left Pinky',
    nameBn: 'বাম কনিষ্ঠা (Pinky)',
  },
  'left-ring': {
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    lightBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    nameEn: 'Left Ring Finger',
    nameBn: 'বাম অনামিকা (Ring)',
  },
  'left-middle': {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    lightBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    nameEn: 'Left Middle Finger',
    nameBn: 'বাম মধ্যমা (Middle)',
  },
  'left-index': {
    bg: 'bg-cyan-500',
    border: 'border-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
    lightBg: 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300',
    nameEn: 'Left Index Finger',
    nameBn: 'বাম তর্জনী (Index)',
  },
  'left-thumb': {
    bg: 'bg-purple-500',
    border: 'border-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    lightBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    nameEn: 'Left Thumb',
    nameBn: 'বাম বৃদ্ধাঙ্গুলি (Thumb)',
  },
  'right-thumb': {
    bg: 'bg-purple-500',
    border: 'border-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    lightBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    nameEn: 'Right Thumb',
    nameBn: 'ডান বৃদ্ধাঙ্গুলি (Thumb)',
  },
  'right-index': {
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    lightBg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    nameEn: 'Right Index Finger',
    nameBn: 'ডান তর্জনী (Index)',
  },
  'right-middle': {
    bg: 'bg-teal-500',
    border: 'border-teal-400',
    text: 'text-teal-600 dark:text-teal-400',
    lightBg: 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
    nameEn: 'Right Middle Finger',
    nameBn: 'ডান মধ্যমা (Middle)',
  },
  'right-ring': {
    bg: 'bg-orange-500',
    border: 'border-orange-400',
    text: 'text-orange-600 dark:text-orange-400',
    lightBg: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
    nameEn: 'Right Ring Finger',
    nameBn: 'ডান অনামিকা (Ring)',
  },
  'right-pinky': {
    bg: 'bg-pink-500',
    border: 'border-pink-400',
    text: 'text-pink-600 dark:text-pink-400',
    lightBg: 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300',
    nameEn: 'Right Pinky',
    nameBn: 'ডান কনিষ্ঠা (Pinky)',
  },
};

// Keyboard Rows layout for rendering
export const KEYBOARD_LAYOUT: {
  rowId: 'number' | 'top' | 'home' | 'bottom' | 'space';
  keys: {
    code: string;
    key: string;
    shiftKey?: string;
    display: string;
    shiftDisplay?: string;
    finger: FingerId;
    hand: 'left' | 'right';
    width?: string;
  }[];
}[] = [
  {
    rowId: 'number',
    keys: [
      { code: 'Backquote', key: '`', shiftKey: '~', display: '`', shiftDisplay: '~', finger: 'left-pinky', hand: 'left' },
      { code: 'Digit1', key: '1', shiftKey: '!', display: '1', shiftDisplay: '!', finger: 'left-pinky', hand: 'left' },
      { code: 'Digit2', key: '2', shiftKey: '@', display: '2', shiftDisplay: '@', finger: 'left-ring', hand: 'left' },
      { code: 'Digit3', key: '3', shiftKey: '#', display: '3', shiftDisplay: '#', finger: 'left-middle', hand: 'left' },
      { code: 'Digit4', key: '4', shiftKey: '$', display: '4', shiftDisplay: '$', finger: 'left-index', hand: 'left' },
      { code: 'Digit5', key: '5', shiftKey: '%', display: '5', shiftDisplay: '%', finger: 'left-index', hand: 'left' },
      { code: 'Digit6', key: '6', shiftKey: '^', display: '6', shiftDisplay: '^', finger: 'right-index', hand: 'right' },
      { code: 'Digit7', key: '7', shiftKey: '&', display: '7', shiftDisplay: '&', finger: 'right-index', hand: 'right' },
      { code: 'Digit8', key: '8', shiftKey: '*', display: '8', shiftDisplay: '*', finger: 'right-middle', hand: 'right' },
      { code: 'Digit9', key: '9', shiftKey: '(', display: '9', shiftDisplay: '(', finger: 'right-ring', hand: 'right' },
      { code: 'Digit0', key: '0', shiftKey: ')', display: '0', shiftDisplay: ')', finger: 'right-pinky', hand: 'right' },
      { code: 'Minus', key: '-', shiftKey: '_', display: '-', shiftDisplay: '_', finger: 'right-pinky', hand: 'right' },
      { code: 'Equal', key: '=', shiftKey: '+', display: '=', shiftDisplay: '+', finger: 'right-pinky', hand: 'right' },
      { code: 'Backspace', key: 'Backspace', display: 'Backspace', finger: 'right-pinky', hand: 'right', width: 'w-16 sm:w-20' },
    ],
  },
  {
    rowId: 'top',
    keys: [
      { code: 'Tab', key: 'Tab', display: 'Tab', finger: 'left-pinky', hand: 'left', width: 'w-12 sm:w-16' },
      { code: 'KeyQ', key: 'q', shiftKey: 'Q', display: 'q', shiftDisplay: 'Q', finger: 'left-pinky', hand: 'left' },
      { code: 'KeyW', key: 'w', shiftKey: 'W', display: 'w', shiftDisplay: 'W', finger: 'left-ring', hand: 'left' },
      { code: 'KeyE', key: 'e', shiftKey: 'E', display: 'e', shiftDisplay: 'E', finger: 'left-middle', hand: 'left' },
      { code: 'KeyR', key: 'r', shiftKey: 'R', display: 'r', shiftDisplay: 'R', finger: 'left-index', hand: 'left' },
      { code: 'KeyT', key: 't', shiftKey: 'T', display: 't', shiftDisplay: 'T', finger: 'left-index', hand: 'left' },
      { code: 'KeyY', key: 'y', shiftKey: 'Y', display: 'y', shiftDisplay: 'Y', finger: 'right-index', hand: 'right' },
      { code: 'KeyU', key: 'u', shiftKey: 'U', display: 'u', shiftDisplay: 'U', finger: 'right-index', hand: 'right' },
      { code: 'KeyI', key: 'i', shiftKey: 'I', display: 'i', shiftDisplay: 'I', finger: 'right-middle', hand: 'right' },
      { code: 'KeyO', key: 'o', shiftKey: 'O', display: 'o', shiftDisplay: 'O', finger: 'right-ring', hand: 'right' },
      { code: 'KeyP', key: 'p', shiftKey: 'P', display: 'p', shiftDisplay: 'P', finger: 'right-pinky', hand: 'right' },
      { code: 'BracketLeft', key: '[', shiftKey: '{', display: '[', shiftDisplay: '{', finger: 'right-pinky', hand: 'right' },
      { code: 'BracketRight', key: ']', shiftKey: '}', display: ']', shiftDisplay: '}', finger: 'right-pinky', hand: 'right' },
      { code: 'Backslash', key: '\\', shiftKey: '|', display: '\\', shiftDisplay: '|', finger: 'right-pinky', hand: 'right' },
    ],
  },
  {
    rowId: 'home',
    keys: [
      { code: 'CapsLock', key: 'CapsLock', display: 'Caps', finger: 'left-pinky', hand: 'left', width: 'w-14 sm:w-18' },
      { code: 'KeyA', key: 'a', shiftKey: 'A', display: 'a', shiftDisplay: 'A', finger: 'left-pinky', hand: 'left' },
      { code: 'KeyS', key: 's', shiftKey: 'S', display: 's', shiftDisplay: 'S', finger: 'left-ring', hand: 'left' },
      { code: 'KeyD', key: 'd', shiftKey: 'D', display: 'd', shiftDisplay: 'D', finger: 'left-middle', hand: 'left' },
      { code: 'KeyF', key: 'f', shiftKey: 'F', display: 'f', shiftDisplay: 'F', finger: 'left-index', hand: 'left' },
      { code: 'KeyG', key: 'g', shiftKey: 'G', display: 'g', shiftDisplay: 'G', finger: 'left-index', hand: 'left' },
      { code: 'KeyH', key: 'h', shiftKey: 'H', display: 'h', shiftDisplay: 'H', finger: 'right-index', hand: 'right' },
      { code: 'KeyJ', key: 'j', shiftKey: 'J', display: 'j', shiftDisplay: 'J', finger: 'right-index', hand: 'right' },
      { code: 'KeyK', key: 'k', shiftKey: 'K', display: 'k', shiftDisplay: 'K', finger: 'right-middle', hand: 'right' },
      { code: 'KeyL', key: 'l', shiftKey: 'L', display: 'l', shiftDisplay: 'L', finger: 'right-ring', hand: 'right' },
      { code: 'Semicolon', key: ';', shiftKey: ':', display: ';', shiftDisplay: ':', finger: 'right-pinky', hand: 'right' },
      { code: 'Quote', key: "'", shiftKey: '"', display: "'", shiftDisplay: '"', finger: 'right-pinky', hand: 'right' },
      { code: 'Enter', key: 'Enter', display: 'Enter', finger: 'right-pinky', hand: 'right', width: 'w-16 sm:w-20' },
    ],
  },
  {
    rowId: 'bottom',
    keys: [
      { code: 'ShiftLeft', key: 'Shift', display: 'Shift', finger: 'left-pinky', hand: 'left', width: 'w-16 sm:w-22' },
      { code: 'KeyZ', key: 'z', shiftKey: 'Z', display: 'z', shiftDisplay: 'Z', finger: 'left-pinky', hand: 'left' },
      { code: 'KeyX', key: 'x', shiftKey: 'X', display: 'x', shiftDisplay: 'X', finger: 'left-ring', hand: 'left' },
      { code: 'KeyC', key: 'c', shiftKey: 'C', display: 'c', shiftDisplay: 'C', finger: 'left-middle', hand: 'left' },
      { code: 'KeyV', key: 'v', shiftKey: 'V', display: 'v', shiftDisplay: 'V', finger: 'left-index', hand: 'left' },
      { code: 'KeyB', key: 'b', shiftKey: 'B', display: 'b', shiftDisplay: 'B', finger: 'left-index', hand: 'left' },
      { code: 'KeyN', key: 'n', shiftKey: 'N', display: 'n', shiftDisplay: 'N', finger: 'right-index', hand: 'right' },
      { code: 'KeyM', key: 'm', shiftKey: 'M', display: 'm', shiftDisplay: 'M', finger: 'right-index', hand: 'right' },
      { code: 'Comma', key: ',', shiftKey: '<', display: ',', shiftDisplay: '<', finger: 'right-middle', hand: 'right' },
      { code: 'Period', key: '.', shiftKey: '>', display: '.', shiftDisplay: '>', finger: 'right-ring', hand: 'right' },
      { code: 'Slash', key: '/', shiftKey: '?', display: '/', shiftDisplay: '?', finger: 'right-pinky', hand: 'right' },
      { code: 'ShiftRight', key: 'Shift', display: 'Shift', finger: 'right-pinky', hand: 'right', width: 'w-16 sm:w-22' },
    ],
  },
  {
    rowId: 'space',
    keys: [
      { code: 'Space', key: ' ', display: 'Spacebar', finger: 'right-thumb', hand: 'right', width: 'w-64 sm:w-80' },
    ],
  },
];

// Fast lookup by character
export function getKeyInfoForChar(char: string): KeyFingerInfo {
  if (char === ' ') {
    return {
      key: ' ',
      display: 'Space',
      finger: 'right-thumb',
      hand: 'right',
      row: 'space',
      color: FINGER_COLORS['right-thumb'].bg,
    };
  }

  for (const row of KEYBOARD_LAYOUT) {
    for (const k of row.keys) {
      if (k.key === char) {
        return {
          key: k.key,
          display: k.display,
          finger: k.finger,
          hand: k.hand,
          shiftRequired: false,
          row: row.rowId,
          color: FINGER_COLORS[k.finger].bg,
        };
      }
      if (k.shiftKey === char) {
        return {
          key: k.key,
          display: k.shiftDisplay || k.display,
          finger: k.finger,
          hand: k.hand,
          shiftRequired: true,
          row: row.rowId,
          color: FINGER_COLORS[k.finger].bg,
        };
      }
    }
  }

  // Fallback for uppercase letters
  const lower = char.toLowerCase();
  for (const row of KEYBOARD_LAYOUT) {
    for (const k of row.keys) {
      if (k.key === lower) {
        return {
          key: k.key,
          display: char,
          finger: k.finger,
          hand: k.hand,
          shiftRequired: char !== lower,
          row: row.rowId,
          color: FINGER_COLORS[k.finger].bg,
        };
      }
    }
  }

  // Default fallback
  return {
    key: char,
    display: char,
    finger: 'left-index',
    hand: 'left',
    row: 'home',
    color: FINGER_COLORS['left-index'].bg,
  };
}

// Full curriculum of guided modules with integrated Checkpoint Games
export const MODULES_DATA: Module[] = [
  {
    id: 'module-1',
    number: 1,
    titleEn: 'Module 1: Home Row Foundation',
    titleBn: 'মডিউল ১: Home Row (ভিত্তি স্থাপন ও পেশী স্মৃতি)',
    subtitleEn: 'Step-by-step finger placement & muscle memory on A S D F and J K L ;',
    subtitleBn: 'A S D F এবং J K L ; তে ধাপে ধাপে আঙুল বসানো ও পেশী স্মৃতি তৈরি',
    icon: 'Home',
    color: 'emerald',
    lessons: [
      {
        id: 'm1-l1',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '1. Index Finger Anchors: F & J',
        titleBn: '১. তর্জনীর ভিত্তি: F ও J',
        descriptionEn: 'Feel the small bump on keys F & J. Left index on F, Right index on J.',
        descriptionBn: 'F এবং J কি-তে ছোট উঁচু দাগটি অনুভব করুন। বাম তর্জনী F এবং ডান তর্জনী J-তে রাখুন।',
        keysIntroduced: ['f', 'j', ' '],
        targetText: 'f f f j j j ff jj ff jj fff jjj f j f j fj jf fj jf f f j j fj jf ff jj fj jf',
        targetAccuracy: 95,
        xpReward: 50,
      },
      {
        id: 'm1-l2',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '2. F & J Alternating Rhythm Drill',
        titleBn: '২. F ও J রিফ্লেক্স ও স্পেসবার ছন্দ',
        descriptionEn: 'Build rhythm and muscle memory by alternating between index fingers.',
        descriptionBn: 'দুই হাতের তর্জনী পর্যায়ক্রমে ব্যবহার করে স্পেসবারসহ সঠিক ছন্দ তৈরি করুন।',
        keysIntroduced: ['f', 'j', ' '],
        targetText: 'fjf jfj ffj jjf fjj jff fjf jfj ffjj jjff ffff jjjj f j f j ff jj fj jf fjf jfj',
        targetAccuracy: 95,
        xpReward: 60,
      },
      {
        id: 'm1-l3',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '3. Middle Fingers: D & K',
        titleBn: '৩. মধ্যমার স্পর্শ: D ও K',
        descriptionEn: 'Left middle finger rests on D, right middle finger rests on K.',
        descriptionBn: 'বাম মধ্যমা D কি-তে এবং ডান মধ্যমা K কি-তে বসবে।',
        keysIntroduced: ['d', 'k'],
        targetText: 'd d d k k k dd kk dd kk ddd kkk d k d k dk kd dk kd d d k k dk kd dd kk dk kd',
        targetAccuracy: 95,
        xpReward: 60,
      },
      {
        id: 'm1-l4',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '4. Index & Middle Coordination: F J D K',
        titleBn: '৪. তর্জনী ও মধ্যমার ৪-আঙুল সমন্বয় (F J D K)',
        descriptionEn: 'Coordinate left and right index and middle fingers together smoothly.',
        descriptionBn: 'বাম ও ডান হাতের তর্জনী এবং মধ্যমা একসাথে সাবলীলভাবে পরিচালনা করুন।',
        keysIntroduced: ['f', 'j', 'd', 'k'],
        targetText: 'fd jk df kj fdk jkd dkf kjd fjk dkj fdf jkj kdk dfj kfd jdf kdf dfk jkd fjd kdf',
        targetAccuracy: 95,
        xpReward: 70,
      },
      {
        id: 'm1-l5',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '5. Ring Fingers: S & L',
        titleBn: '৫. অনামিকার অবস্থান: S ও L',
        descriptionEn: 'Left ring finger on S, right ring finger on L.',
        descriptionBn: 'বাম অনামিকা S কি-তে এবং ডান অনামিকা L কি-তে রাখুন।',
        keysIntroduced: ['s', 'l'],
        targetText: 's s s l l l ss ll ss ll sss lll s l s l sl ls sl ls s s l l sl ls ss ll sl ls',
        targetAccuracy: 95,
        xpReward: 70,
      },
      {
        id: 'm1-l6',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '6. 6-Finger Coordination: S D F & J K L',
        titleBn: '৬. ৬-আঙুল সমন্বয়: S D F ও J K L',
        descriptionEn: 'Coordinate three fingers on each hand across the home row.',
        descriptionBn: 'দুই হাতের ৩টি করে আঙুলের সমন্বয়ে মসৃণ মুভমেন্ট অনুশীলন করুন।',
        keysIntroduced: ['s', 'd', 'f', 'j', 'k', 'l'],
        targetText: 'sdf jkl fds lkj sfj dlk fsl djk sld fjk dsf lkj sfd jkl sdf jkl fsld jkds lkjs dfsl',
        targetAccuracy: 95,
        xpReward: 80,
      },
      {
        id: 'm1-l7',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '7. Pinky Fingers: A & ;',
        titleBn: '৭. কনিষ্ঠার নিয়ন্ত্রণ: A ও ;',
        descriptionEn: 'Left pinky rests on A, right pinky rests on semicolon (;).',
        descriptionBn: 'বাম কনিষ্ঠা A কি-তে এবং ডান কনিষ্ঠা সেমিকোলন (;) কি-তে থাকবে।',
        keysIntroduced: ['a', ';'],
        targetText: 'a a a ; ; ; aa ;; aa ;; aaa ;;; a ; a ; a; ;a a; ;a a a ; ; a; ;a aa ;; a; ;a',
        targetAccuracy: 95,
        xpReward: 80,
      },
      {
        id: 'm1-l8',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '8. Full Home Row (A S D F J K L ;) Fluency',
        titleBn: '৮. সম্পূর্ণ হোম রো ছান্দিক ড্রিল',
        descriptionEn: 'Practice all 8 home row keys together in smooth rhythm without looking down.',
        descriptionBn: 'কিবোর্ডের দিকে না তাকিয়ে সবকটি হোম রো অক্ষর ছন্দে টাইপ করুন।',
        keysIntroduced: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
        targetText: 'asdf jkl; fdsa ;lkj asdf ;lkj fjdk sla; a;sldkfj fads klas jfad a;sldkfj asdf jkl; fdsa ;lkj',
        targetAccuracy: 95,
        xpReward: 90,
      },
      {
        id: 'm1-l9',
        moduleId: 'module-1',
        type: 'typing',
        titleEn: '9. Home Row Real Words Mastery',
        titleBn: '৯. হোম রো দিয়ে তৈরি অর্থপূর্ণ শব্দ',
        descriptionEn: 'Type real English words using solely the home row keys.',
        descriptionBn: 'শুধুমাত্র হোম রো-এর অক্ষর দিয়ে অর্থপূর্ণ শব্দ টাইপ করুন।',
        keysIntroduced: ['all', 'fall', 'glad', 'flask', 'salad', 'asks'],
        targetText: 'all fall glad flask salad asks dads lads fall all glad salad asks lads fall glad salad flask all dads',
        targetAccuracy: 95,
        xpReward: 100,
      },
      {
        id: 'm1-game',
        moduleId: 'module-1',
        type: 'game',
        titleEn: '🎮 Checkpoint: Home Row Sky Fall Challenge',
        titleBn: '🎮 মডিউল ১ চ্যালেঞ্জ: হোম রো স্কাইফল গেম',
        descriptionEn: 'Defend against falling home row letters and words in real-time reflex mode!',
        descriptionBn: 'হোম রো-এর পড়া অক্ষর মাটিতে পড়ার আগেই দ্রুত টাইপ করে ধ্বংস করুন!',
        keysIntroduced: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
        targetText: 'game-mode-home',
        targetAccuracy: 90,
        xpReward: 150,
      },
    ],
  },
  {
    id: 'module-2',
    number: 2,
    titleEn: 'Module 2: Top Row & Bottom Row',
    titleBn: 'মডিউল ২: টপ রো ও বটম রো বিস্তার',
    subtitleEn: 'Reach up to E, R, U, I and down to C, V, M, N',
    subtitleBn: 'আঙুল উপরে E, R, U, I ও নিচে C, V, M, N এ নেওয়া',
    icon: 'ArrowUpDown',
    color: 'blue',
    lessons: [
      {
        id: 'm2-l1',
        moduleId: 'module-2',
        type: 'typing',
        titleEn: '1. Top Row: E & I Reach',
        titleBn: '১. টপ রো: E ও I স্পর্শ',
        descriptionEn: 'Left middle reaches up from D to E. Right middle reaches up from K to I.',
        descriptionBn: 'D থেকে বাম মধ্যমা উপরে E-তে যাবে। K থেকে ডান মধ্যমা উপরে I-তে যাবে।',
        keysIntroduced: ['e', 'i'],
        targetText: 'ded ded kik kik de ki de ki side like hide slide seek kill filed lied kiss',
        targetAccuracy: 95,
        xpReward: 90,
      },
      {
        id: 'm2-l2',
        moduleId: 'module-2',
        type: 'typing',
        titleEn: '2. Top Row: R & U Reach',
        titleBn: '২. টপ রো: R ও U স্পর্শ',
        descriptionEn: 'Left index reaches up from F to R. Right index reaches up from J to U.',
        descriptionBn: 'F থেকে বাম তর্জনী R-এ এবং J থেকে ডান তর্জনী U-তে প্রসারিত হবে।',
        keysIntroduced: ['r', 'u'],
        targetText: 'frf juj frf juj red user rust surf fire pure sure fur fruit rule ruler',
        targetAccuracy: 95,
        xpReward: 90,
      },
      {
        id: 'm2-l3',
        moduleId: 'module-2',
        type: 'typing',
        titleEn: '3. Top Row: T & Y Extension',
        titleBn: '৩. টপ রো: T ও Y প্রসারিত করা',
        descriptionEn: 'Left index reaches up-right to T. Right index reaches up-left to Y.',
        descriptionBn: 'বাম তর্জনী T-তে এবং ডান তর্জনী Y-তে আড়াআড়ি পৌঁছাবে।',
        keysIntroduced: ['t', 'y'],
        targetText: 'ftf jyj ftf jyj they that your trust try stay easy yeti yesterday street',
        targetAccuracy: 95,
        xpReward: 100,
      },
      {
        id: 'm2-l4',
        moduleId: 'module-2',
        type: 'typing',
        titleEn: '4. Top Row: W, O, Q, P Wings',
        titleBn: '৪. টপ রো: W, O, Q ও P কভার করা',
        descriptionEn: 'Left ring to W, Left pinky to Q. Right ring to O, Right pinky to P.',
        descriptionBn: 'বাম অনামিকা W, কনিষ্ঠা Q। ডান অনামিকা O, কনিষ্ঠা P।',
        keysIntroduced: ['w', 'o', 'q', 'p'],
        targetText: 'sws lol aqa p;p quick power word quote loop plot pop wipe wrap quote world',
        targetAccuracy: 95,
        xpReward: 110,
      },
      {
        id: 'm2-l5',
        moduleId: 'module-2',
        type: 'typing',
        titleEn: '5. Bottom Row: C, V, M, N Discovery',
        titleBn: '৫. বটম রো: C, V, M ও N আয়ত্ত করা',
        descriptionEn: 'Left middle to C, left index to V. Right index to M and N.',
        descriptionBn: 'বাম মধ্যমা নিচে C, তর্জনী V। ডান তর্জনী নিচে M ও N।',
        keysIntroduced: ['c', 'v', 'm', 'n'],
        targetText: 'dcd fvf jmj jnj come view main name civil move calm vine money mine',
        targetAccuracy: 95,
        xpReward: 120,
      },
      {
        id: 'm2-l6',
        moduleId: 'module-2',
        type: 'typing',
        titleEn: '6. Bottom Row: Z, X, B & Punctuation Marks',
        titleBn: '৬. বটম রো: Z, X, B, কমা ও ফুলস্টপ',
        descriptionEn: 'Left pinky to Z, left ring to X, left index to B. Right middle to comma, right ring to period.',
        descriptionBn: 'বাম কনিষ্ঠা Z, অনামিকা X, তর্জনী B। ডান মধ্যমা কমা (,) ও অনামিকা ডট (.)।',
        keysIntroduced: ['z', 'x', 'b', ',', '.'],
        targetText: 'aza sxs fbf k,k l.l zero box blue best zoom next scan calm, fine. good, best.',
        targetAccuracy: 95,
        xpReward: 130,
      },
      {
        id: 'm2-game',
        moduleId: 'module-2',
        type: 'game',
        titleEn: '🎮 Checkpoint: Top & Bottom Sky Fall Challenge',
        titleBn: '🎮 মডিউল ২ চ্যালেঞ্জ: টপ ও বটম স্কাইফল গেম',
        descriptionEn: 'Test your top and bottom reaches in rapid falling reflex action!',
        descriptionBn: 'টপ এবং বটম রো-এর দ্রুত গতির রিফ্লেক্স চ্যালেঞ্জ!',
        keysIntroduced: ['e', 'r', 'u', 'i', 'c', 'v', 'm', 'n'],
        targetText: 'game-mode-top_bottom',
        targetAccuracy: 90,
        xpReward: 160,
      },
    ],
  },
  {
    id: 'module-3',
    number: 3,
    titleEn: 'Module 3: Shift Keys, Capitals & Punctuations',
    titleBn: 'মডিউল ৩: শিফট কী, ক্যাপিটাল ও বিরামচিহ্ন',
    subtitleEn: 'Coordination between Left & Right Shift keys for capitals',
    subtitleBn: 'বাম ও ডান শিফট সমন্বয় করে ক্যাপিটাল লেটার লেখা',
    icon: 'ArrowBigUp',
    color: 'purple',
    lessons: [
      {
        id: 'm3-l1',
        moduleId: 'module-3',
        type: 'typing',
        titleEn: '1. Left Shift for Right Hand Keys',
        titleBn: '১. ডান হাতের অক্ষরের জন্য বাম শিফট',
        descriptionEn: 'Hold Left Shift with left pinky while right hand types J, K, L, U, I, O, P, M, N.',
        descriptionBn: 'বাম কনিষ্ঠা দিয়ে Left Shift চেপে রেখে ডান হাত দিয়ে J, K, L, U, I, O, P ইত্যাদি টাইপ করুন।',
        keysIntroduced: ['J', 'K', 'L', 'U', 'I', 'O', 'P', 'M', 'N'],
        targetText: 'Joy Key Lion Moon Sun Nice Path India Only Paris Jack Milan Oslo',
        targetAccuracy: 95,
        xpReward: 120,
      },
      {
        id: 'm3-l2',
        moduleId: 'module-3',
        type: 'typing',
        titleEn: '2. Right Shift for Left Hand Keys',
        titleBn: '২. বাম হাতের অক্ষরের জন্য ডান শিফট',
        descriptionEn: 'Hold Right Shift with right pinky while left hand types F, D, S, A, R, E, W, Q, C, V, B.',
        descriptionBn: 'ডান কনিষ্ঠা দিয়ে Right Shift চেপে রেখে বাম হাত দিয়ে F, D, S, A, R, E, W ইত্যাদি লিখুন।',
        keysIntroduced: ['F', 'D', 'S', 'A', 'R', 'E', 'W', 'Q', 'C', 'V', 'B'],
        targetText: 'Fast Door Star Apple Rain Echo Wind Quiet City View Brave France Dream',
        targetAccuracy: 95,
        xpReward: 120,
      },
      {
        id: 'm3-l3',
        moduleId: 'module-3',
        type: 'typing',
        titleEn: '3. Full Sentences with Proper Punctuation',
        titleBn: '৩. বিরামচিহ্নসহ সম্পূর্ণ বাক্য',
        descriptionEn: 'Practice real full English sentences with capitals, periods, commas, and question marks.',
        descriptionBn: 'ক্যাপিটাল লেটার, কমা, ফুলস্টপ এবং প্রশ্নচিহ্ন সহ সম্পূর্ণ বাক্য অনুশীলন করুন।',
        keysIntroduced: ['?', '!', '"', "'"],
        targetText: 'Practice makes perfect. Never look down at the keyboard! Are you ready? Yes, I am!',
        targetAccuracy: 95,
        xpReward: 140,
      },
      {
        id: 'm3-game',
        moduleId: 'module-3',
        type: 'game',
        titleEn: '🎮 Checkpoint: Capital & Shift Rush Game',
        titleBn: '🎮 মডিউল ৩ চ্যালেঞ্জ: শিফট ও ক্যাপিটাল স্পিড গেম',
        descriptionEn: 'Quickly trigger shift keys and uppercase words before time runs out!',
        descriptionBn: 'দ্রুত শিফট চেপে ক্যাপিটাল লেটার টাইপ করার রিফ্লেক্স টেস্ট!',
        keysIntroduced: ['Shift', 'Capitals'],
        targetText: 'game-mode-all',
        targetAccuracy: 90,
        xpReward: 170,
      },
    ],
  },
  {
    id: 'module-4',
    number: 4,
    titleEn: 'Module 4: Numbers & Special Symbols',
    titleBn: 'মডিউল ৪: সংখ্যা ও স্পেশাল ক্যারেক্টার',
    subtitleEn: 'Number row 1 to 0 and symbols like @, #, $, %, &',
    subtitleBn: '১ থেকে ০ পর্যন্ত সংখ্যা এবং @, #, $, %, & ইত্যাদি চিহ্ন',
    icon: 'Hash',
    color: 'amber',
    lessons: [
      {
        id: 'm4-l1',
        moduleId: 'module-4',
        type: 'typing',
        titleEn: '1. Number Row Mastery: 1, 2, 3, 4, 5',
        titleBn: '১. বাম হাতের সংখ্যা: ১, ২, ৩, ৪, ৫',
        descriptionEn: 'Left pinky 1, ring 2, middle 3, index 4 and 5.',
        descriptionBn: 'বাম কনিষ্ঠা ১, অনামিকা ২, মধ্যমা ৩, এবং তর্জনী ৪ ও ৫।',
        keysIntroduced: ['1', '2', '3', '4', '5'],
        targetText: '1 2 3 4 5 12 34 51 25 31 42 123 451 234 521 345',
        targetAccuracy: 95,
        xpReward: 130,
      },
      {
        id: 'm4-l2',
        moduleId: 'module-4',
        type: 'typing',
        titleEn: '2. Number Row Mastery: 6, 7, 8, 9, 0',
        titleBn: '২. ডান হাতের সংখ্যা: ৬, ৭, ৮, ৯, ০',
        descriptionEn: 'Right index 6 and 7, middle 8, ring 9, pinky 0.',
        descriptionBn: 'ডান তর্জনী ৬ ও ৭, মধ্যমা ৮, অনামিকা ৯, কনিষ্ঠা ০।',
        keysIntroduced: ['6', '7', '8', '9', '0'],
        targetText: '6 7 8 9 0 67 89 90 78 60 789 678 890 2026 1995 2030',
        targetAccuracy: 95,
        xpReward: 130,
      },
      {
        id: 'm4-l3',
        moduleId: 'module-4',
        type: 'typing',
        titleEn: '3. Developer & Everyday Symbols',
        titleBn: '৩. গুরুত্বপূর্ণ স্পেশাল সিম্বল',
        descriptionEn: 'Shift + numbers for @, #, $, %, &, *, (, ), -, +, =.',
        descriptionBn: 'শিফট ব্যবহার করে ইমেইল, কোডিং ও গাণিতিক চিহ্ন অনুশীলন করুন।',
        keysIntroduced: ['@', '#', '$', '%', '&', '*', '(', ')', '+', '='],
        targetText: 'user@email.com #100 $50 100% (item & total) 10 + 20 = 30 [test] {key: val}',
        targetAccuracy: 94,
        xpReward: 150,
      },
      {
        id: 'm4-game',
        moduleId: 'module-4',
        type: 'game',
        titleEn: '🎮 Checkpoint: Numbers & Symbols Defense',
        titleBn: '🎮 মডিউল ৪ চ্যালেঞ্জ: নাম্বার ও সিম্বল ডিফেন্স গেম',
        descriptionEn: 'Sharpen your numeric and coding key reflexes!',
        descriptionBn: 'সংখ্যা ও স্পেশাল সিম্বলের দ্রুত টাইপিং গেম!',
        keysIntroduced: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        targetText: 'game-mode-all',
        targetAccuracy: 90,
        xpReward: 180,
      },
    ],
  },
  {
    id: 'module-5',
    number: 5,
    titleEn: 'Module 5: Paragraphs & Speed Fluency',
    titleBn: 'মডিউল ৫: পূর্ণাঙ্গ প্যারাগ্রাফ ও স্পিড বৃদ্ধি',
    subtitleEn: 'Build speed while maintaining 98%+ pinpoint accuracy',
    subtitleBn: '৯৮%+ নির্ভুলতা বজায় রেখে দ্রুত গতি অর্জন',
    icon: 'Flame',
    color: 'rose',
    lessons: [
      {
        id: 'm5-l1',
        moduleId: 'module-5',
        type: 'typing',
        titleEn: '1. The Power of Muscle Memory',
        titleBn: '১. পেশীর স্মৃতির জাদু (Muscle Memory)',
        descriptionEn: 'A smooth inspirational paragraph on building unconscious typing reflex.',
        descriptionBn: 'না দেখে টাইপ করার আত্মবিশ্বাস অর্জনের জন্য একটি সুন্দর অনুচ্ছেদ।',
        keysIntroduced: ['All Keys'],
        targetText: 'Touch typing is not about looking faster. It is about feeling the keys through muscle memory. When you trust your fingers, your thoughts flow directly onto the screen without interruption.',
        targetAccuracy: 96,
        xpReward: 180,
      },
      {
        id: 'm5-l2',
        moduleId: 'module-5',
        type: 'typing',
        titleEn: '2. Proverb & Wisdom Fluency',
        titleBn: '২. জ্ঞান ও প্রবাদের চর্চা',
        descriptionEn: 'Classic timeless proverbs to train cadence and rhythm.',
        descriptionBn: 'প্রবাদ বাক্যের মাধ্যমে টাইপিংয়ের সাবলীল ছন্দ তৈরি করুন।',
        keysIntroduced: ['All Keys'],
        targetText: 'Consistency is the key to mastery. A journey of a thousand miles begins with a single step. Keep your hands relaxed, breathe calmly, and let accuracy lead the way.',
        targetAccuracy: 96,
        xpReward: 200,
      },
      {
        id: 'm5-l3',
        moduleId: 'module-5',
        type: 'typing',
        titleEn: '3. Grandmaster Speed Run',
        titleBn: '৩. গ্র্যান্ডমাস্টার টাইপিং টেস্ট',
        descriptionEn: 'The ultimate graduation text to earn your Master Typist Certificate!',
        descriptionBn: 'টাইপিং একাডেমির সার্টিফিকেট অর্জনের জন্য চূড়ান্ত টেস্ট!',
        keysIntroduced: ['All Keys'],
        targetText: 'Congratulations on reaching the final frontier! By maintaining home row discipline, respecting every finger zone, and prioritizing accuracy above raw speed, you have mastered the art of touch typing.',
        targetAccuracy: 97,
        xpReward: 250,
      },
      {
        id: 'm5-game',
        moduleId: 'module-5',
        type: 'game',
        titleEn: '🎮 Grand Finale: Sky Fall Master Game',
        titleBn: '🎮 গ্র্যান্ড ফাইনাল: স্কাইফল মাস্টার গেম',
        descriptionEn: 'The ultimate typing reflex test before graduation!',
        descriptionBn: 'কোর্স গ্র্যাজুয়েশনের আগে চূড়ান্ত স্পিড ও রিফ্লেক্স টেস্ট!',
        keysIntroduced: ['All Keys'],
        targetText: 'game-mode-all',
        targetAccuracy: 90,
        xpReward: 300,
      },
    ],
  },
];

export const BADGES_DATA: Badge[] = [
  {
    id: 'first-key',
    titleEn: 'First Touch',
    titleBn: 'হাতে খড়ি',
    descriptionEn: 'Completed your very first touch typing lesson.',
    descriptionBn: 'প্রথম টাইপিং লেসন সফলভাবে সম্পন্ন করেছেন।',
    icon: 'Sparkles',
    category: 'completion',
  },
  {
    id: 'home-row-ninja',
    titleEn: 'Home Row Master',
    titleBn: 'হোম রো মাস্টার',
    descriptionEn: 'Completed all lessons in Module 1: Home Row.',
    descriptionBn: 'মডিউল ১-এর সবকটি হোম রো লেসন শেষ করেছেন।',
    icon: 'Crown',
    category: 'completion',
  },
  {
    id: 'pure-accuracy',
    titleEn: 'Zero Mistake Maestro',
    titleBn: '১০০% নির্ভুল বীর',
    descriptionEn: 'Finished any lesson with 100% accuracy.',
    descriptionBn: 'কোনো ভুল ছাড়াই ১০০% নির্ভুলভাবে লেসন শেষ করেছেন।',
    icon: 'Target',
    category: 'accuracy',
  },
  {
    id: 'top-bottom-explorer',
    titleEn: 'Keyboard Explorer',
    titleBn: 'কিবোর্ড অভিযাত্রী',
    descriptionEn: 'Unlocked and conquered Top and Bottom rows.',
    descriptionBn: 'টপ এবং বটম রো-এর সকল অক্ষর আয়ত্ত করেছেন।',
    icon: 'Compass',
    category: 'completion',
  },
  {
    id: 'shift-specialist',
    titleEn: 'Shift Sorcerer',
    titleBn: 'শিফট স্পেশালিস্ট',
    descriptionEn: 'Mastered uppercase and punctuation coordination.',
    descriptionBn: 'ক্যাপিটাল ও বিরামচিহ্নের শিফট ব্যবহারে পারদর্শিতা।',
    icon: 'Zap',
    category: 'accuracy',
  },
  {
    id: 'speed-demon',
    titleEn: 'Speed Champion (40+ WPM)',
    titleBn: 'গতিমান টাইপিস্ট (৪০+ WPM)',
    descriptionEn: 'Achieved over 40 words per minute on a lesson.',
    descriptionBn: 'যেকোনো লেসনে ৪০ WPM-এর বেশি গতি অর্জন করেছেন।',
    icon: 'Flame',
    category: 'speed',
  },
  {
    id: 'skyfall-hero',
    titleEn: 'Sky Fall Defender',
    titleBn: 'শব্দ বৃষ্টি বিজয়ী',
    descriptionEn: 'Scored over 500 points in the Sky Fall game.',
    descriptionBn: 'স্কাই ফল গেম-এ ৫০০-এর বেশি স্কোর করেছেন।',
    icon: 'Gamepad2',
    category: 'game',
  },
  {
    id: 'streak-keeper',
    titleEn: 'Consistency Legend',
    titleBn: 'অবিচল সাধক',
    descriptionEn: 'Maintained a daily practice streak.',
    descriptionBn: 'নিয়মিত প্রতিদিন টাইপিং অনুশীলন করেছেন।',
    icon: 'Calendar',
    category: 'streak',
  },
  {
    id: 'graduate',
    titleEn: 'Certified Touch Typist',
    titleBn: 'সার্টিফাইড টাচ টাইপিস্ট',
    descriptionEn: 'Completed all 5 core modules and earned official certificate.',
    descriptionBn: 'কোর্সের ৫টি মডিউল সম্পন্ন করে সার্টিফিকেট অর্জন করেছেন।',
    icon: 'Award',
    category: 'completion',
  },
];

// Smart repetition practice generator based on user's weak keys
export function generateSmartDrill(weakKeys: Record<string, number>): { text: string; targetedKeys: string[] } {
  const sorted = Object.entries(weakKeys)
    .filter(([char, count]) => count > 0 && char.trim().length > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([char]) => char);

  if (sorted.length === 0) {
    return {
      text: 'f j d k s l a ; e r u i c v m n the quick brown fox jumps over the lazy dog',
      targetedKeys: ['f', 'j', 'd', 'k', 's', 'l'],
    };
  }

  // Construct drill containing target keys sandwiched with home row anchors
  const words: string[] = [];
  for (let i = 0; i < 6; i++) {
    for (const key of sorted) {
      words.push(`f${key}f`);
      words.push(`j${key}j`);
      words.push(`d${key}k`);
      words.push(`${key}${key} ${key}f`);
    }
  }

  // Add realistic words that contain these keys
  const dictionary: Record<string, string[]> = {
    r: ['tree', 'rare', 'trust', 'run', 'fire', 'dark', 'rest', 'bird'],
    t: ['that', 'this', 'take', 'time', 'test', 'team', 'tell', 'talk'],
    e: ['seen', 'feel', 'deep', 'need', 'ever', 'free', 'here', 'even'],
    i: ['item', 'lion', 'iron', 'king', 'milk', 'mint', 'high', 'side'],
    u: ['user', 'rust', 'luck', 'dust', 'unit', 'pure', 'sure', 'turn'],
    c: ['city', 'cold', 'code', 'call', 'camp', 'card', 'care', 'cook'],
    v: ['view', 'very', 'vine', 'vast', 'vote', 'vain', 'veil', 'vent'],
    m: ['main', 'make', 'more', 'moon', 'mind', 'milk', 'most', 'move'],
    n: ['name', 'near', 'nice', 'news', 'next', 'nine', 'node', 'noon'],
    b: ['best', 'blue', 'book', 'bird', 'back', 'ball', 'base', 'beam'],
    p: ['pass', 'path', 'page', 'park', 'past', 'peak', 'peer', 'pink'],
    o: ['open', 'over', 'only', 'once', 'oval', 'onto', 'oxen', 'odor'],
  };

  const extraWords: string[] = [];
  for (const k of sorted) {
    const list = dictionary[k.toLowerCase()];
    if (list) {
      extraWords.push(...list);
    }
  }

  const combined = [...words.slice(0, 10), ...extraWords.slice(0, 10)];
  return {
    text: combined.join(' '),
    targetedKeys: sorted,
  };
}
