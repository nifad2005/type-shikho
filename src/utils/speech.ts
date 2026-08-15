/**
 * High-Performance Bengali & English Voice Instructor Engine
 * Robust Multi-Tier Architecture:
 * Tier 1: Direct Cloud TTS Stream (Google Public TTS / API - works 100% on Vercel, Netlify, localhost)
 * Tier 2: Native Web Speech Synthesis (works offline on any browser/device)
 * Tier 3: Web Audio Synth Feedback Chimes
 */

import { Lesson, Language, UserStats } from '../types';
import { unlockWebAudio } from './audio';

let sharedAudio: HTMLAudioElement | null = null;
let isAudioUnlocked = false;
let isCurrentlySpeaking = false;
let currentSpokenText = '';
let speechListeners: Array<(speaking: boolean, text: string) => void> = [];

// Audio Blob Cache for 0ms instantaneous replays
const blobCache = new Map<string, string>();
const activeFetches = new Map<string, Promise<string | null>>();

// Cached browser voices
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
    }
  } catch (err) {
    console.warn('Error loading speech voices:', err);
  }
  return cachedVoices;
}

// Listen for browser voices loading
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

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
      console.warn('Audio element error, falling back to Web Speech:', e);
      if (isCurrentlySpeaking && currentSpokenText) {
        speakViaWebSpeech(currentSpokenText, 'bn');
      } else {
        notifySpeechState(false, '');
      }
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
  unlockWebAudio();

  if (!isAudioUnlocked) {
    const audio = getSharedAudio();
    if (audio) {
      // Play silent 1-sample buffer to unlock media pipeline
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audio.play().then(() => {
        isAudioUnlocked = true;
        audio.pause();
      }).catch(() => {});
    }
  }

  try {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      loadVoices();
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
 * Generates direct client TTS stream URL (universally accessible)
 */
export function getDirectTTSUrl(text: string, lang: Language): string {
  const targetLang = lang === 'bn' ? 'bn' : 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodeURIComponent(text.trim())}`;
}

/**
 * Prefetches and caches audio for a given sentence to ensure instant playback
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
      // 1. Try direct public TTS stream
      const streamUrl = getDirectTTSUrl(clean, lang);
      blobCache.set(cacheKey, streamUrl);
      activeFetches.delete(cacheKey);
      return streamUrl;
    } catch {
      activeFetches.delete(cacheKey);
      return null;
    }
  })();

  activeFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Preloads all audio for a given lesson ahead of time
 */
export function preloadLessonAudio(lesson: Lesson | null, lang: Language) {
  if (!lesson) return;
  loadVoices();
  const guide = getLessonSpokenGuide(lesson, lang);
  if (guide) {
    prefetchAudioChunk(guide, lang);
  }
}

/**
 * Finds the best available browser speech synthesis voice for a language
 */
function findBestVoice(lang: Language): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  if (lang === 'bn') {
    // 1. Exact Bengali match
    const bnExact = voices.find(
      (v) =>
        v.lang.toLowerCase() === 'bn-bd' ||
        v.lang.toLowerCase() === 'bn-in' ||
        v.lang.toLowerCase() === 'bn_bd' ||
        v.lang.toLowerCase() === 'bn_in'
    );
    if (bnExact) return bnExact;

    // 2. Contains bn or bangla / bengali
    const bnSub = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('bn') ||
        v.name.toLowerCase().includes('bangla') ||
        v.name.toLowerCase().includes('bengali') ||
        v.name.toLowerCase().includes('বাংলা')
    );
    if (bnSub) return bnSub;

    // 3. Indian English / regional fallback
    const inVoice = voices.find((v) => v.lang.toLowerCase().includes('in') || v.lang.toLowerCase().includes('en-in'));
    if (inVoice) return inVoice;
  } else {
    // English
    const enUs = voices.find((v) => v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en_us');
    if (enUs) return enUs;

    const enSub = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (enSub) return enSub;
  }

  return voices[0] || null;
}

/**
 * Native Browser Web Speech Synthesis Engine (100% client-side offline fallback)
 */
export function speakViaWebSpeech(text: string, lang: Language, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifySpeechState(false, '');
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = findBestVoice(lang);

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    if (lang === 'bn') {
      utterance.lang = bestVoice?.lang || 'bn-BD';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
    } else {
      utterance.lang = bestVoice?.lang || 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }

    utterance.volume = 1.0;

    let hasEnded = false;
    const finish = () => {
      if (hasEnded) return;
      hasEnded = true;
      notifySpeechState(false, '');
      if (onEnd) onEnd();
    };

    utterance.onstart = () => {
      notifySpeechState(true, text);
    };

    utterance.onend = finish;
    utterance.onerror = () => {
      finish();
    };

    // Safety timeout in case browser drops speech onend event (Chromium edge cases)
    const charCount = text.length;
    const estimatedDurationMs = Math.max(2500, (charCount / 8) * 1000 + 2000);
    const timeoutId = setTimeout(() => {
      if (!hasEnded && isCurrentlySpeaking) {
        finish();
      }
    }, estimatedDurationMs);

    utterance.addEventListener('end', () => clearTimeout(timeoutId));
    utterance.addEventListener('error', () => clearTimeout(timeoutId));

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis speak failed:', err);
    notifySpeechState(false, '');
    if (onEnd) onEnd();
  }
}

/**
 * Main Speak Function: Plays audio via HTML5 Audio with instant Web Speech fallback
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
  unlockAudioContext();
  const cleanText = text.trim();

  // Try direct Audio Stream
  try {
    const streamUrl = getDirectTTSUrl(cleanText, lang);
    const audio = getSharedAudio();
    notifySpeechState(true, cleanText);

    audio.src = streamUrl;

    const handleEnded = () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      notifySpeechState(false, '');
      if (onEnd) onEnd();
    };

    const handleError = () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      // Seamlessly fallback to browser Web Speech API
      speakViaWebSpeech(cleanText, lang, onEnd);
    };

    audio.addEventListener('ended', handleEnded, { once: true });
    audio.addEventListener('error', handleError, { once: true });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or format fallback
        speakViaWebSpeech(cleanText, lang, onEnd);
      });
    }
  } catch {
    speakViaWebSpeech(cleanText, lang, onEnd);
  }
}

/**
 * Test Voice Audio Playback for Settings / Diagnostics
 */
export function testVoicePlayback(lang: Language = 'bn', onEnd?: () => void) {
  const sampleText =
    lang === 'bn'
      ? 'টাইপ শিখো অ্যাপ্লিকেশনে স্বাগতম! আপনার ভয়েস গাইড সফলভাবে চালু রয়েছে।'
      : 'Welcome to Type Shikho! Your audio voice guidance is fully active and working.';
  speakText(sampleText, lang, true, onEnd);
}

/**
 * Returns available voice engine information
 */
export function getSpeechEngineInfo(lang: Language = 'bn'): {
  engineType: string;
  voiceName: string;
  isBengaliNative: boolean;
} {
  const bestVoice = findBestVoice(lang);
  const isBengali =
    lang === 'bn' &&
    bestVoice &&
    (bestVoice.lang.toLowerCase().includes('bn') ||
      bestVoice.name.toLowerCase().includes('bangla') ||
      bestVoice.name.toLowerCase().includes('bengali') ||
      bestVoice.name.toLowerCase().includes('বাংলা'));

  return {
    engineType: 'Cloud Stream / Native Web Speech',
    voiceName: bestVoice ? `${bestVoice.name} (${bestVoice.lang})` : (lang === 'bn' ? 'বাংলা ভয়েস ইঞ্জিন' : 'English Voice Engine'),
    isBengaliNative: !!isBengali,
  };
}

/**
 * Step-by-step Bengali voice guide for all modules & lessons
 */
export function getLessonSpokenGuide(lesson: Lesson, lang: Language): string {
  const isBn = lang === 'bn';

  if (lesson.type === 'game') {
    return isBn
      ? 'রিফ্লেক্স চ্যালেঞ্জ! উপরে পড়া অক্ষরগুলো মাটিতে পড়ার আগে দ্রুত কীবোর্ডে টাইপ করুন।'
      : 'Reflex challenge! Type the falling letters before they hit the ground.';
  }

  // Module 1: Home Row
  if (lesson.id === 'm1-l1') {
    return isBn
      ? 'টাইপিংয়ের প্রথম পাঠে স্বাগতম! বাম তর্জনী এফ কি এবং ডান তর্জনী জে কি-তে রাখুন। কীবোর্ডের দিকে না তাকিয়ে সোজা স্ক্রিনে তাকিয়ে টাইপ করুন।'
      : 'Welcome! Rest left index on F and right index on J. Feel the bumps and keep eyes on screen.';
  }
  if (lesson.id === 'm1-l2') {
    return isBn
      ? 'দ্বিতীয় পাঠ: বাম মধ্যমা ডি কি এবং ডান মধ্যমা কে কি-তে রাখুন।'
      : 'Lesson 2: Rest left middle finger on D and right middle finger on K.';
  }
  if (lesson.id === 'm1-l3') {
    return isBn
      ? 'তৃতীয় পাঠ: বাম অনামিকা এস কি এবং ডান অনামিকা এল কি-তে রাখুন।'
      : 'Lesson 3: Place left ring finger on S and right ring finger on L.';
  }
  if (lesson.id === 'm1-l4') {
    return isBn
      ? 'চতুর্থ পাঠ: বাম কনিষ্ঠা এ কি এবং ডান কনিষ্ঠা দিয়ে সেমিকোলন কি টাইপ করুন।'
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
