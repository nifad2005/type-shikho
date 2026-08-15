import React from 'react';
import { FingerId, Language, ThemeMode } from '../types';
import { FINGER_COLORS } from '../utils/keyboardMap';

interface VirtualHandsProps {
  activeFinger: FingerId | null;
  targetKeyDisplay: string;
  language: Language;
  theme?: ThemeMode;
}

export const VirtualHands: React.FC<VirtualHandsProps> = ({
  activeFinger,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  const leftFingers: { id: FingerId; homeKey: string }[] = [
    { id: 'left-pinky', homeKey: 'a' },
    { id: 'left-ring', homeKey: 's' },
    { id: 'left-middle', homeKey: 'd' },
    { id: 'left-index', homeKey: 'f' },
  ];

  const rightFingers: { id: FingerId; homeKey: string }[] = [
    { id: 'right-index', homeKey: 'j' },
    { id: 'right-middle', homeKey: 'k' },
    { id: 'right-ring', homeKey: 'l' },
    { id: 'right-pinky', homeKey: ';' },
  ];

  const isThumbActive = activeFinger === 'left-thumb' || activeFinger === 'right-thumb';

  return (
    <div id="virtual-hands-guide" className="flex items-center justify-center gap-3 select-none py-1">
      {/* Left Hand 4 Finger Dots */}
      <div className="flex items-center gap-1.5">
        {leftFingers.map((f) => {
          const active = activeFinger === f.id;
          const style = FINGER_COLORS[f.id];
          return (
            <div
              key={f.id}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md font-mono text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all ${
                active
                  ? `${style.bg} text-white scale-110 shadow-xs ring-1 ring-white/60`
                  : isDark
                  ? 'bg-slate-900 text-slate-500'
                  : isSepia
                  ? 'bg-[#eae0cf] text-stone-500'
                  : 'bg-slate-200/80 text-slate-500'
              }`}
            >
              {f.homeKey}
            </div>
          );
        })}
      </div>

      {/* Spacebar / Thumb Dot */}
      <div
        className={`px-3 py-1 rounded-md font-mono text-[10px] font-semibold transition-all ${
          isThumbActive
            ? 'bg-purple-500 text-white scale-105 shadow-xs'
            : isDark
            ? 'bg-slate-900 text-slate-600'
            : isSepia
            ? 'bg-[#eae0cf] text-stone-400'
            : 'bg-slate-200/80 text-slate-400'
        }`}
      >
        ␣
      </div>

      {/* Right Hand 4 Finger Dots */}
      <div className="flex items-center gap-1.5">
        {rightFingers.map((f) => {
          const active = activeFinger === f.id;
          const style = FINGER_COLORS[f.id];
          return (
            <div
              key={f.id}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md font-mono text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all ${
                active
                  ? `${style.bg} text-white scale-110 shadow-xs ring-1 ring-white/60`
                  : isDark
                  ? 'bg-slate-900 text-slate-500'
                  : isSepia
                  ? 'bg-[#eae0cf] text-stone-500'
                  : 'bg-slate-200/80 text-slate-500'
              }`}
            >
              {f.homeKey}
            </div>
          );
        })}
      </div>
    </div>
  );
};
