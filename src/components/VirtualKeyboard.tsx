import React from 'react';
import { KeyFingerInfo, ThemeMode } from '../types';
import { KEYBOARD_LAYOUT, FINGER_COLORS } from '../utils/keyboardMap';

interface VirtualKeyboardProps {
  targetKeyInfo: KeyFingerInfo | null;
  lastPressedKey: string | null;
  isErrorKey: boolean;
  theme?: ThemeMode;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKeyInfo,
  lastPressedKey,
  isErrorKey,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  return (
    <div
      id="virtual-keyboard"
      className={`w-full max-w-3xl mx-auto p-2 rounded-2xl select-none transition-colors ${
        isDark
          ? 'bg-slate-900/60'
          : isSepia
          ? 'bg-[#f4ede0]/70'
          : 'bg-slate-200/50'
      }`}
    >
      <div className="flex flex-col gap-1">
        {KEYBOARD_LAYOUT.map((row) => (
          <div key={row.rowId} className="flex justify-center items-center gap-1">
            {row.keys.map((k) => {
              const isTarget =
                targetKeyInfo &&
                (targetKeyInfo.key === k.key ||
                  (k.shiftKey && targetKeyInfo.key === k.shiftKey) ||
                  (k.key.length === 1 && targetKeyInfo.key.toLowerCase() === k.key.toLowerCase()));

              const isShiftHighlight =
                targetKeyInfo?.shiftRequired &&
                ((targetKeyInfo.hand === 'right' && k.code === 'ShiftLeft') ||
                  (targetKeyInfo.hand === 'left' && k.code === 'ShiftRight'));

              const isPressed =
                lastPressedKey &&
                (lastPressedKey === k.key ||
                  lastPressedKey.toLowerCase() === k.key.toLowerCase() ||
                  lastPressedKey === k.shiftKey ||
                  (lastPressedKey === ' ' && k.code === 'Space'));

              const fingerStyle = FINGER_COLORS[k.finger];
              const widthClass = k.width ? k.width : 'w-7 sm:w-9 md:w-10 flex-1 max-w-[42px]';
              const heightClass = 'h-7 sm:h-8 md:h-9';

              let keyClasses = '';
              if (isTarget || isShiftHighlight) {
                keyClasses = `${fingerStyle.bg} text-white font-bold scale-[1.03] shadow-xs`;
              } else if (isPressed) {
                keyClasses = isErrorKey
                  ? 'bg-rose-500 text-white animate-shake'
                  : 'bg-teal-500 text-white scale-95';
              } else {
                if (isDark) {
                  keyClasses = 'bg-slate-800 text-slate-300 hover:bg-slate-750';
                } else if (isSepia) {
                  keyClasses = 'bg-[#fbf7ee] text-stone-700 hover:bg-stone-100';
                } else {
                  keyClasses = 'bg-white text-slate-700 hover:bg-slate-50';
                }
              }

              return (
                <div
                  key={k.code}
                  className={`
                    relative rounded-lg font-mono text-[11px] sm:text-xs font-medium flex flex-col items-center justify-center transition-all duration-75
                    ${widthClass} ${heightClass} ${keyClasses}
                  `}
                >
                  {k.shiftDisplay && (
                    <span className="text-[8px] opacity-40 leading-none mb-0.5">
                      {k.shiftDisplay}
                    </span>
                  )}
                  <span className="leading-none">{k.display}</span>

                  {(k.key === 'f' || k.key === 'j') && (
                    <div
                      className={`absolute bottom-0.5 w-2 h-0.5 rounded-full opacity-60 ${
                        isTarget || isPressed ? 'bg-white' : 'bg-current'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
