/**
 * High-Performance Bengali Voice Instructor Engine
 * Specifically tuned for Bengali (বাংলা) language learning:
 * Tier 1: Server Audio TTS Stream (/api/tts proxy - works seamlessly on Cloud Run & Vercel Serverless)
 * Tier 2: Native Web Speech Synthesis (bn-BD / bn-IN browser engine for offline / static hosting)
 */

import { Lesson, Language, UserStats } from '../types';
import { unlockWebAudio } from './audio';

let sharedAudio: HTMLAudioElement | null = null;
let isAudioUnlocked = false;
let isCurrentlySpeaking = false;
let currentSpokenText = '';
let speechListeners: Array<(speaking: boolean, text: string) => void> = [];

// Audio Blob Object URL Cache for instantaneous 0ms replays
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
      console.warn('HTML Audio playback error, falling back to Web Speech:', e);
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
 * Prefetches audio chunk from /api/tts proxy into a local blob URL
 */
export async function prefetchAudioChunk(text: string, lang: Language = 'bn'): Promise<string | null> {
  const clean = text.trim();
  if (!clean || typeof window === 'undefined') return null;

  const cacheKey = `bn:${clean}`;
  if (blobCache.has(cacheKey)) {
    return blobCache.get(cacheKey)!;
  }

  if (activeFetches.has(cacheKey)) {
    return activeFetches.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const url = `/api/tts?text=${encodeURIComponent(clean)}&lang=bn`;
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('audio')) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        blobCache.set(cacheKey, objectUrl);
        activeFetches.delete(cacheKey);
        return objectUrl;
      }
    } catch (err) {
      console.warn('TTS fetch failed, will fallback to browser speech:', err);
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
export function preloadLessonAudio(lesson: Lesson | null, lang: Language = 'bn') {
  if (!lesson) return;
  loadVoices();
  const guide = getLessonSpokenGuide(lesson, 'bn');
  if (guide) {
    prefetchAudioChunk(guide, 'bn');
  }
}

/**
 * Finds the best available browser speech synthesis voice for Bengali
 */
function findBestBengaliVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact match for bn-BD or bn-IN
  const bnExact = voices.find(
    (v) =>
      v.lang.toLowerCase() === 'bn-bd' ||
      v.lang.toLowerCase() === 'bn-in' ||
      v.lang.toLowerCase() === 'bn_bd' ||
      v.lang.toLowerCase() === 'bn_in'
  );
  if (bnExact) return bnExact;

  // 2. Name contains Bengali / Bangla / বাংলা
  const bnSub = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith('bn') ||
      v.name.toLowerCase().includes('bangla') ||
      v.name.toLowerCase().includes('bengali') ||
      v.name.toLowerCase().includes('বাংলা')
  );
  if (bnSub) return bnSub;

  // 3. Indian regional voice fallback
  const inVoice = voices.find((v) => v.lang.toLowerCase().includes('in') || v.lang.toLowerCase().includes('en-in'));
  if (inVoice) return inVoice;

  return voices[0] || null;
}

/**
 * Native Browser Web Speech Synthesis Engine (100% offline fallback for Bengali)
 */
export function speakViaWebSpeech(text: string, _lang: Language = 'bn', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifySpeechState(false, '');
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = findBestBengaliVoice();

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.lang = bestVoice?.lang || 'bn-BD';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;
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

    // Safety timeout in case browser drops speech onend event
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
 * Main Bengali Voice Instructor Speak Function
 */
export async function speakText(
  text: string,
  _lang: Language = 'bn',
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

  const cacheKey = `bn:${cleanText}`;
  let audioUrl = blobCache.get(cacheKey);

  if (!audioUrl && activeFetches.has(cacheKey)) {
    audioUrl = (await activeFetches.get(cacheKey)) || undefined;
  }

  if (!audioUrl) {
    audioUrl = (await prefetchAudioChunk(cleanText, 'bn')) || undefined;
  }

  // If server TTS audio is available, play via HTML5 Audio
  if (audioUrl) {
    const audio = getSharedAudio();
    notifySpeechState(true, cleanText);

    try {
      audio.src = audioUrl;

      const handleEnded = () => {
        audio.removeEventListener('ended', handleEnded);
        notifySpeechState(false, '');
        if (onEnd) onEnd();
      };
      audio.addEventListener('ended', handleEnded, { once: true });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('HTML Audio play error, fallback to Web Speech:', err);
          speakViaWebSpeech(cleanText, 'bn', onEnd);
        });
      }
      return;
    } catch (err) {
      console.warn('HTML Audio execution failed, fallback to Web Speech:', err);
      speakViaWebSpeech(cleanText, 'bn', onEnd);
      return;
    }
  }

  // Fallback: Browser Web Speech API
  speakViaWebSpeech(cleanText, 'bn', onEnd);
}

/**
 * Test Voice Audio Playback for Settings / Diagnostics (Pure Bengali)
 */
export function testVoicePlayback(_lang: Language = 'bn', onEnd?: () => void) {
  const sampleText = 'টাইপ শিখো অ্যাপ্লিকেশনে স্বাগতম! আপনার বাংলা ভয়েস গাইড সফলভাবে চালু রয়েছে।';
  speakText(sampleText, 'bn', true, onEnd);
}

/**
 * Returns available voice engine information
 */
export function getSpeechEngineInfo(): {
  engineType: string;
  voiceName: string;
  isBengaliNative: boolean;
} {
  const bestVoice = findBestBengaliVoice();
  const isBengali =
    bestVoice &&
    (bestVoice.lang.toLowerCase().includes('bn') ||
      bestVoice.name.toLowerCase().includes('bangla') ||
      bestVoice.name.toLowerCase().includes('bengali') ||
      bestVoice.name.toLowerCase().includes('বাংলা'));

  return {
    engineType: 'বাংলা অডিও সিন্থেসাইজার (Bangla Voice Stream)',
    voiceName: bestVoice ? `${bestVoice.name} (${bestVoice.lang})` : 'বাংলা ন্যাচারাল ভয়েস',
    isBengaliNative: !!isBengali,
  };
}

/**
 * Step-by-step Bengali voice guide for all modules & lessons (100% Bangla)
 */
export function getLessonSpokenGuide(lesson: Lesson, _lang?: Language): string {
  if (lesson.type === 'game') {
    return 'রিফ্লেক্স চ্যালেঞ্জ! উপরে পড়া অক্ষরগুলো মাটিতে পড়ার আগে দ্রুত কীবোর্ডে টাইপ করুন।';
  }

  // Module 1: Home Row
  if (lesson.id === 'm1-l1') {
    return 'টাইপিংয়ের প্রথম পাঠে স্বাগতম! বাম তর্জনী এফ কি এবং ডান তর্জনী জে কি-তে রাখুন। কীবোর্ডের দিকে না তাকিয়ে সোজা স্ক্রিনে তাকিয়ে টাইপ করুন।';
  }
  if (lesson.id === 'm1-l2') {
    return 'দ্বিতীয় পাঠ: বাম মধ্যমা ডি কি এবং ডান মধ্যমা কে কি-তে রাখুন।';
  }
  if (lesson.id === 'm1-l3') {
    return 'তৃতীয় পাঠ: বাম অনামিকা এস কি এবং ডান অনামিকা এল কি-তে রাখুন।';
  }
  if (lesson.id === 'm1-l4') {
    return 'চতুর্থ পাঠ: বাম কনিষ্ঠা এ কি এবং ডান কনিষ্ঠা দিয়ে সেমিকোলন কি টাইপ করুন।';
  }
  if (lesson.id === 'm1-l5' || lesson.id === 'm1-l6') {
    return 'হোম রো কম্বিনেশন ড্রিল। বৃদ্ধাঙ্গুলি দিয়ে স্পেসবার চাপুন এবং স্বাভাবিক ছন্দ বজায় রাখুন।';
  }

  // Module 2: Top & Bottom Row
  if (lesson.id === 'm2-l1') {
    return 'টপ রো স্পর্শ: ডি থেকে উপরে উঠে ই কি এবং কে থেকে উপরে উঠে আই কি টাইপ করুন।';
  }
  if (lesson.id === 'm2-l2') {
    return 'এফ থেকে তর্জনী উপরে তুলে আর কি, এবং জে থেকে উপরে তুলে ইউ কি টাইপ করুন।';
  }
  if (lesson.id === 'm2-l3') {
    return 'বাম তর্জনী দিয়ে টি কি এবং ডান তর্জনী দিয়ে ওয়াই কি টাইপ করুন।';
  }
  if (lesson.id === 'm2-l4') {
    return 'টপ রো শেষ অক্ষর: কিউ, ডব্লিউ, ও এবং পি অনুশীলন করুন।';
  }
  if (lesson.id === 'm2-l5' || lesson.id === 'm2-l6') {
    return 'বটম রো অনুশীলন: আঙুল নিচে নামিয়ে শান্তভাবে টাইপ করুন।';
  }

  // Module 3: Shift & Capitals
  if (lesson.id.startsWith('m3-')) {
    return 'বড় হাতের অক্ষরের জন্য বিপরীত হাতের কনিষ্ঠা দিয়ে শিফট চেপে ধরুন।';
  }

  // Module 4: Numbers & Symbols
  if (lesson.id.startsWith('m4-')) {
    return 'সংখ্যা রো: হোম রো থেকে সোজা উপরে আঙুল তুলে সংখ্যা টাইপ করুন।';
  }

  // Module 5: Mastery & Speed
  if (lesson.id.startsWith('m5-')) {
    return 'মাস্টারি প্যারাগ্রাফ: গতি নয়, নির্ভুলতার সাথে সাবলীলভাবে টাইপ করুন।';
  }

  return lesson.descriptionBn || lesson.titleBn;
}

/**
 * Pre-programmed, Expert Rule-Based Bengali Typing Teacher Advice Engine
 */
export function getExpertCoachTip(
  userStats: UserStats,
  lesson: Lesson,
  _language?: Language
): string {
  const mistakes = (Object.entries(userStats.keyMistakes || {}) as [string, number][])
    .filter(([char, count]) => count > 0 && char.trim().length > 0)
    .sort((a, b) => b[1] - a[1]);

  const topMistakeKey = mistakes.length > 0 ? mistakes[0][0].toLowerCase() : null;

  if (topMistakeKey) {
    if (topMistakeKey === 'f' || topMistakeKey === 'j') {
      return `আপনার ${topMistakeKey.toUpperCase()} কি-তে ভুল হচ্ছে। খাঁজটি অনুভব করে তর্জনী স্থির রাখুন।`;
    }
    if (['e', 'i', 'r', 'u', 't', 'y', 'o', 'p', 'q', 'w'].includes(topMistakeKey)) {
      return `টপ রো কি (${topMistakeKey.toUpperCase()}) টাইপ করার পর আঙুল হোম রো-তে ফিরিয়ে আনুন।`;
    }
    if (['z', 'x', 'c', 'v', 'b', 'n', 'm'].includes(topMistakeKey)) {
      return `বটম রো কি (${topMistakeKey.toUpperCase()}) টাইপের সময় কব্জি সোজা রাখুন।`;
    }
    if (topMistakeKey === 'a' || topMistakeKey === ';') {
      return `কনিষ্ঠা কি (${topMistakeKey.toUpperCase()}) টাইপ করার সময় পুরো হাত না নাড়িয়ে শুধু কনিষ্ঠা ব্যবহার করুন।`;
    }
  }

  if (lesson.moduleId === 'module-1') {
    return 'কীবোর্ডের দিকে না তাকিয়ে সোজা স্ক্রিনের দিকে তাকান এবং স্বাভাবিক ছন্দে টাইপ করুন।';
  }

  return 'গতি বাড়ানোর তাড়াহুড়ো করবেন না, নির্ভুলতা বজায় রাখলে গতি এমনিতেই বৃদ্ধি পাবে।';
}
