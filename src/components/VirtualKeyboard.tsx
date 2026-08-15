import React from 'react';
import { FingerId, KeyFingerInfo } from '../types';
import { KEYBOARD_LAYOUT, FINGER_COLORS } from '../utils/keyboardMap';

interface VirtualKeyboardProps {
  targetKeyInfo: KeyFingerInfo | null;
  lastPressedKey: string | null;
  isErrorKey: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKeyInfo,
  lastPressedKey,
  isErrorKey,
}) => {
  return (
    <div
      id="virtual-keyboard"
      className="w-full max-w-4xl mx-auto p-2 sm:p-4 bg-slate-900/90 dark:bg-slate-950/95 border border-slate-700/70 rounded-2xl shadow-xl backdrop-blur-md select-none"
    >
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {KEYBOARD_LAYOUT.map((row) => (
          <div key={row.rowId} className="flex justify-center items-center gap-1 sm:gap-1.5">
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

              // Base width
              const widthClass = k.width ? k.width : 'w-7 sm:w-11 md:w-12 flex-1 max-w-[50px]';
              const heightClass = 'h-8 sm:h-11 md:h-12';

              return (
                <div
                  key={k.code}
                  className={`
                    relative rounded-lg font-mono text-xs sm:text-sm font-semibold flex flex-col items-center justify-center transition-all duration-100 shadow-xs
                    ${widthClass} ${heightClass}
                    ${
                      isTarget || isShiftHighlight
                        ? `${fingerStyle.bg} text-white font-bold scale-105 ring-2 sm:ring-4 ring-white/60 shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10 animate-pulse`
                        : isPressed
                        ? isErrorKey
                          ? 'bg-rose-600 text-white animate-shake'
                          : 'bg-emerald-600 text-white'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 border-b-2 border-slate-950'
                    }
                  `}
                >
                  {/* Shift label if key has one */}
                  {k.shiftDisplay && (
                    <span
                      className={`text-[9px] sm:text-[10px] leading-none mb-0.5 ${
                        isTarget && targetKeyInfo?.shiftRequired ? 'font-black text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {k.shiftDisplay}
                    </span>
                  )}

                  {/* Main Key Display */}
                  <span className="leading-none">{k.display}</span>

                  {/* Finger colored dot indicator at the bottom edge */}
                  {!isTarget && !isShiftHighlight && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full opacity-60 ${fingerStyle.bg}`}
                    />
                  )}

                  {/* Tactile bump marker for F and J keys */}
                  {(k.key === 'f' || k.key === 'j') && (
                    <div className="absolute bottom-1 w-3 sm:w-4 h-0.5 rounded-full bg-slate-300 dark:bg-slate-400 opacity-80" />
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
