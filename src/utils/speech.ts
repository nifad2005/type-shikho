/**
 * High-Performance Bengali & English Voice Instructor Engine
 * ZERO AI / Deterministic audio streaming with instant caching & zero latency.
 */

import { Lesson, Language, UserStats } from '../types';

// Dedicated single audio element for seamless browser autoplay authorization
let sharedAudio: HTMLAudioElement | null = null;
let isAudioUnlocked = false;
let isCurrentlySpeaking = false;
let currentSpokenText = '';
let speechListeners: Array<(speaking: boolean, text: string) => void> = [];

// Audio Blob Cache for 0ms instantaneous replays
const blobCache = new Map<string, string>();
const activeFetches = new Map<string, Promise<string | null>>();

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio && typeof window !== 'undefined') {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';

    sharedAudio.addEventListener('ended', () => {
      notifySpeechState(false, '');
    });

    sharedAudio.addEventListener('pause', () => {
      if (sharedAudio && sharedAudio.currentTime === sharedAudio.duration) {
        notifySpeechState(false, '');
      }
    });

    sharedAudio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      notifySpeechState(false, '');
    });
  }
  return sharedAudio!;
}

function notifySpeechState(speaking: boolean, text = '') {
  isCurrentlySpeaking = speaking;
  currentSpokenText = speaking ? text : '';
  speechListeners.forEach((l) => l(speaking, text));
}

export function isAudioSpeaking(): boolean {
  return isCurrentlySpeaking;
}

export function getCurrentSpokenText(): string {
  return currentSpokenText;
}

export function subscribeToSpeechState(listener: (speaking: boolean, text: string) => void) {
  speechListeners.push(listener);
  return () => {
    speechListeners = speechListeners.filter((l) => l !== listener);
  };
}

/**
 * Unlocks browser audio policy on first user interaction
 */
export function unlockAudioContext() {
  if (typeof window === 'undefined') return;
  const audio = getSharedAudio();
  if (!isAudioUnlocked && audio) {
    // Play silent 1-sample buffer or tiny sound to unlock media pipeline
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    audio.play().then(() => {
      isAudioUnlocked = true;
      audio.pause();
    }).catch(() => {
      // User hasn't interacted yet
    });
  }

  try {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}
}

// Global auto-unlock listeners
if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    unlockAudioContext();
  };
  window.addEventListener('click', handleInteraction, { passive: true });
  window.addEventListener('keydown', handleInteraction, { passive: true });
  window.addEventListener('touchstart', handleInteraction, { passive: true });
}

/**
 * Stops all active speech playback immediately
 */
export function stopSpeaking() {
  if (sharedAudio) {
    try {
      sharedAudio.pause();
      sharedAudio.currentTime = 0;
    } catch {}
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  notifySpeechState(false, '');
}

/**
 * Prefetches and caches audio for a given sentence to ensure 0ms latency
 */
export async function prefetchAudioChunk(text: string, lang: Language): Promise<string | null> {
  const clean = text.trim();
  if (!clean || typeof window === 'undefined') return null;

  const cacheKey = `${lang}:${clean}`;
  if (blobCache.has(cacheKey)) {
    return blobCache.get(cacheKey)!;
  }

  if (activeFetches.has(cacheKey)) {
    return activeFetches.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const url = `/api/tts?text=${encodeURIComponent(clean)}&lang=${lang}`;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        blobCache.set(cacheKey, objectUrl);
        activeFetches.delete(cacheKey);
        return objectUrl;
      }
    } catch (err) {
      console.warn('Prefetch audio error:', err);
    }
    activeFetches.delete(cacheKey);
    return null;
  })();

  activeFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Preloads all audio for a given lesson ahead of time
 */
export function preloadLessonAudio(lesson: Lesson | null, lang: Language) {
  if (!lesson) return;
  const guide = getLessonSpokenGuide(lesson, lang);
  if (guide) {
    prefetchAudioChunk(guide, lang);
  }
}

/**
 * Speaks text using the fastest available preloaded audio stream or native TTS
 */
export async function speakText(
  text: string,
  lang: Language = 'bn',
  enabled = true,
  onEnd?: () => void
) {
  if (!enabled || !text || text.trim().length === 0) {
    if (onEnd) onEnd();
    return;
  }

  stopSpeaking();
  const cleanText = text.trim();
  const audio = getSharedAudio();

  notifySpeechState(true, cleanText);

  const cacheKey = `${lang}:${cleanText}`;
  let audioUrl = blobCache.get(cacheKey);

  if (!audioUrl) {
    // Check if prefetch is in progress
    if (activeFetches.has(cacheKey)) {
      audioUrl = (await activeFetches.get(cacheKey)) || undefined;
    }
  }

  // If still not cached, directly stream from API
  if (!audioUrl) {
    audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${lang}`;
    // Pre-cache in background for next time
    prefetchAudioChunk(cleanText, lang);
  }

  try {
    audio.src = audioUrl;
    
    // Attach one-time onended handler
    const handleEnded = () => {
      audio.removeEventListener('ended', handleEnded);
      notifySpeechState(false, '');
      if (onEnd) onEnd();
    };
    audio.addEventListener('ended', handleEnded, { once: true });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play auto-unlock retry needed:', err);
        // Fallback to Web Speech if Audio is blocked
        speakViaWebSpeech(cleanText, lang, onEnd);
      });
    }
  } catch (err) {
    console.warn('Speak playback error:', err);
    speakViaWebSpeech(cleanText, lang, onEnd);
  }
}

/**
 * Native Browser Web Speech Synthesis Fallback
 */
function speakViaWebSpeech(text: string, lang: Language, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifySpeechState(false, '');
    if (onEnd) onEnd();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (lang === 'bn') {
      const bnVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('bn') ||
          v.name.toLowerCase().includes('bangla') ||
          v.name.toLowerCase().includes('bengali')
      );
      if (bnVoice) {
        utterance.voice = bnVoice;
      }
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
    } else {
      const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
    }

    utterance.onend = () => {
      notifySpeechState(false, '');
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      notifySpeechState(false, '');
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    notifySpeechState(false, '');
    if (onEnd) onEnd();
  }
}

/**
 * Step-by-step Bengali voice guide for all modules & lessons
 */
export function getLessonSpokenGuide(lesson: Lesson, lang: Language): string {
  const isBn = lang === 'bn';

  if (lesson.type === 'game') {
    return isBn
      ? 'স্কাইফল রিফ্লেক্স চ্যালেঞ্জ! হোম রো পজিশনে আঙুল রাখুন এবং লেটারগুলো পড়ার আগেই দ্রুত টাইপ করুন।'
      : 'Welcome to Skyfall challenge! Place fingers on home row and destroy letters before they hit the bottom.';
  }

  // Module 1: Home Row
  if (lesson.id === 'm1-l1') {
    return isBn
      ? 'টাইপিং শেখার প্রথম পাঠে স্বাগতম! বাম হাতের তর্জনী এফ কি-তে এবং ডান হাতের তর্জনী জে কি-তে রাখুন। কিবোর্ডের দিকে না তাকিয়ে সোজা স্ক্রিনে তাকিয়ে টাইপ শুরু করুন।'
      : 'Welcome! Place your left index on F and right index on J. Feel the bumps and keep your eyes on the screen.';
  }
  if (lesson.id === 'm1-l2') {
    return isBn
      ? 'দ্বিতীয় পাঠ: বাম হাতের মধ্যমা ডি কি-তে এবং ডান হাতের মধ্যমা কে কি-তে রাখুন।'
      : 'Lesson 2: Rest your left middle finger on D and right middle finger on K.';
  }
  if (lesson.id === 'm1-l3') {
    return isBn
      ? 'তৃতীয় পাঠ: বাম হাতের অনামিকা এস কি-তে এবং ডান হাতের অনামিকা এল কি-তে স্থাপন করুন।'
      : 'Lesson 3: Place your left ring finger on S and right ring finger on L.';
  }
  if (lesson.id === 'm1-l4') {
    return isBn
      ? 'চতুর্থ পাঠ: বাম কনিষ্ঠা দিয়ে এ কি এবং ডান কনিষ্ঠা দিয়ে সেমিকোলন কি টাইপ করুন।'
      : 'Lesson 4: Left pinky on A, right pinky on semicolon.';
  }
  if (lesson.id === 'm1-l5' || lesson.id === 'm1-l6') {
    return isBn
      ? 'হোম রো কম্বিনেশন ড্রিল। বৃদ্ধাঙ্গুলি দিয়ে স্পেসবার চাপুন এবং স্বাভাবিক ছন্দ বজায় রাখুন।'
      : 'Home row fluency drill. Tap the spacebar with your thumb in rhythm.';
  }

  // Module 2: Top & Bottom Row
  if (lesson.id === 'm2-l1') {
    return isBn
      ? 'টপ রো স্পর্শ: ডি থেকে উপরে উঠে ই কি এবং কে থেকে উপরে উঠে আই কি টাইপ করুন।'
      : 'Top row reach: Reach up from D to E with left middle finger, and from K to I with right middle finger.';
  }
  if (lesson.id === 'm2-l2') {
    return isBn
      ? 'এফ থেকে তর্জনী উপরে তুলে আর কি, এবং জে থেকে উপরে তুলে ইউ কি টাইপ করুন।'
      : 'Reach up from F to R with left index, and from J to U with right index.';
  }
  if (lesson.id === 'm2-l3') {
    return isBn
      ? 'বাম তর্জনী দিয়ে টি কি এবং ডান তর্জনী দিয়ে ওয়াই কি টাইপ করুন।'
      : 'Reach inwards to T with left index, and inwards to Y with right index.';
  }
  if (lesson.id === 'm2-l4') {
    return isBn
      ? 'টপ রো শেষ অক্ষর: কিউ, ডব্লিউ, ও এবং পি অনুশীলন করুন।'
      : 'Top row outer reach: Q, W, O, and P reach.';
  }
  if (lesson.id === 'm2-l5' || lesson.id === 'm2-l6') {
    return isBn
      ? 'বটম রো অনুশীলন: আঙুল নিচে নামিয়ে শান্তভাবে টাইপ করুন।'
      : 'Bottom row exploration: Smoothly reach down to bottom keys.';
  }

  // Module 3: Shift & Capitals
  if (lesson.id.startsWith('m3-')) {
    return isBn
      ? 'বড় হাতের অক্ষরের জন্য বিপরীত হাতের কনিষ্ঠা দিয়ে শিফট চেপে ধরুন।'
      : 'Shift key coordination: Use the opposite pinky to hold shift while striking the letter.';
  }

  // Module 4: Numbers & Symbols
  if (lesson.id.startsWith('m4-')) {
    return isBn
      ? 'সংখ্যা রো: হোম রো থেকে সোজা উপরে আঙুল তুলে সংখ্যা টাইপ করুন।'
      : 'Number row coordination: Reach straight up from home row to type numbers.';
  }

  // Module 5: Mastery & Speed
  if (lesson.id.startsWith('m5-')) {
    return isBn
      ? 'মাস্টারি প্যারাগ্রাফ: গতি নয়, নির্ভুলতার সাথে সাবলীলভাবে টাইপ করুন।'
      : 'Mastery paragraph: Focus on pure accuracy and consistent cadence.';
  }

  return isBn ? lesson.descriptionBn : lesson.descriptionEn;
}

/**
 * Pre-programmed, Expert Rule-Based Bengali Typing Teacher Advice Engine
 */
export function getExpertCoachTip(
  userStats: UserStats,
  lesson: Lesson,
  language: Language
): string {
  const isBn = language === 'bn';

  const mistakes = (Object.entries(userStats.keyMistakes || {}) as [string, number][])
    .filter(([char, count]) => count > 0 && char.trim().length > 0)
    .sort((a, b) => b[1] - a[1]);

  const topMistakeKey = mistakes.length > 0 ? mistakes[0][0].toLowerCase() : null;

  if (topMistakeKey) {
    if (topMistakeKey === 'f' || topMistakeKey === 'j') {
      return isBn
        ? `আপনার ${topMistakeKey.toUpperCase()} কি-তে ভুল হচ্ছে। খাঁজটি অনুভব করে তর্জনী স্থির রাখুন।`
        : `Frequent errors on ${topMistakeKey.toUpperCase()}. Feel the tactile bump to anchor your index finger.`;
    }
    if (['e', 'i', 'r', 'u', 't', 'y', 'o', 'p', 'q', 'w'].includes(topMistakeKey)) {
      return isBn
        ? `টপ রো কি (${topMistakeKey.toUpperCase()}) টাইপ করার পর আঙুল হোম রো-তে ফিরিয়ে আনুন।`
        : `After striking top row key (${topMistakeKey.toUpperCase()}), immediately return your finger to home row.`;
    }
    if (['z', 'x', 'c', 'v', 'b', 'n', 'm'].includes(topMistakeKey)) {
      return isBn
        ? `বটম রো কি (${topMistakeKey.toUpperCase()}) টাইপের সময় কব্জি সোজা রাখুন।`
        : `Keep wrists straight and floating gently when reaching for bottom row key (${topMistakeKey.toUpperCase()}).`;
    }
    if (topMistakeKey === 'a' || topMistakeKey === ';') {
      return isBn
        ? `কনিষ্ঠা কি (${topMistakeKey.toUpperCase()}) টাইপ করার সময় পুরো হাত না নাড়িয়ে শুধু কনিষ্ঠা ব্যবহার করুন।`
        : `Use only your pinky finger to strike ${topMistakeKey.toUpperCase()} without moving your whole hand.`;
    }
  }

  if (lesson.moduleId === 'module-1') {
    return isBn
      ? 'কীবোর্ডের দিকে না তাকিয়ে সোজা স্ক্রিনের দিকে তাকান এবং স্বাভাবিক ছন্দে টাইপ করুন।'
      : 'Keep your eyes on the screen and type in a natural rhythm.';
  }

  return isBn
    ? 'গতি বাড়ানোর তাড়াহুড়ো করবেন না, নির্ভুলতা বজায় রাখলে গতি এমনিতেই বৃদ্ধি পাবে।'
    : 'Never rush for speed; consistent accuracy will automatically unlock fast typing.';
}
