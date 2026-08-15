import React from 'react';
import { FingerId, Language } from '../types';
import { FINGER_COLORS } from '../utils/keyboardMap';
import { motion } from 'motion/react';

interface VirtualHandsProps {
  activeFinger: FingerId | null;
  targetKeyDisplay: string;
  language: Language;
}

export const VirtualHands: React.FC<VirtualHandsProps> = ({
  activeFinger,
  targetKeyDisplay,
  language,
}) => {
  const isBn = language === 'bn';

  // Helper to check if a finger is currently active
  const isActive = (id: FingerId) => activeFinger === id;

  return (
    <div id="virtual-hands-guide" className="w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Target finger advice pill */}
      <div className="mb-2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium shadow-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {isBn ? 'ব্যবহৃত আঙুল:' : 'Target Finger:'}
        </span>
        {activeFinger ? (
          <span className={`font-semibold px-2.5 py-0.5 rounded-md ${FINGER_COLORS[activeFinger].lightBg} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full ${FINGER_COLORS[activeFinger].bg} animate-pulse`} />
            {isBn ? FINGER_COLORS[activeFinger].nameBn : FINGER_COLORS[activeFinger].nameEn}
            <span className="text-slate-400">|</span>
            <span className="font-mono font-bold">{targetKeyDisplay === ' ' ? (isBn ? 'স্পেসবার' : 'Space') : targetKeyDisplay}</span>
          </span>
        ) : (
          <span className="text-slate-400">{isBn ? 'হোম রো পজিশনে হাত রাখুন' : 'Rest fingers on Home Row'}</span>
        )}
      </div>

      {/* Hands Container */}
      <div className="w-full flex justify-center items-end gap-6 sm:gap-12 px-2 py-2">
        {/* LEFT HAND */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
            {isBn ? 'বাম হাত (Left)' : 'Left Hand'}
          </div>

          <div className="relative w-40 sm:w-56 h-36 sm:h-44 flex justify-center items-end">
            {/* SVG Illustration of Left Hand */}
            <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-md">
              {/* Palm Base */}
              <path
                d="M 45 150 C 45 100, 60 85, 100 85 C 140 85, 155 100, 155 150 Z"
                className="fill-amber-100/70 dark:fill-slate-700/60 stroke-slate-300 dark:stroke-slate-600"
                strokeWidth="2"
              />

              {/* Left Pinky */}
              <g className="cursor-default">
                <rect
                  x="30"
                  y={isActive('left-pinky') ? 35 : 45}
                  width="18"
                  height="65"
                  rx="9"
                  className={`transition-all duration-150 ${
                    isActive('left-pinky')
                      ? 'fill-rose-500 stroke-rose-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                      : 'fill-rose-100/90 dark:fill-rose-950/50 stroke-rose-300 dark:stroke-rose-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="39" y={isActive('left-pinky') ? 50 : 60} textAnchor="middle" className={`text-[10px] font-bold ${isActive('left-pinky') ? 'fill-white' : 'fill-rose-600 dark:fill-rose-400'}`}>
                  A
                </text>
              </g>

              {/* Left Ring */}
              <g className="cursor-default">
                <rect
                  x="56"
                  y={isActive('left-ring') ? 18 : 28}
                  width="20"
                  height="80"
                  rx="10"
                  className={`transition-all duration-150 ${
                    isActive('left-ring')
                      ? 'fill-amber-500 stroke-amber-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                      : 'fill-amber-100/90 dark:fill-amber-950/50 stroke-amber-300 dark:stroke-amber-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="66" y={isActive('left-ring') ? 35 : 45} textAnchor="middle" className={`text-[10px] font-bold ${isActive('left-ring') ? 'fill-white' : 'fill-amber-600 dark:fill-amber-400'}`}>
                  S
                </text>
              </g>

              {/* Left Middle */}
              <g className="cursor-default">
                <rect
                  x="84"
                  y={isActive('left-middle') ? 10 : 20}
                  width="22"
                  height="88"
                  rx="11"
                  className={`transition-all duration-150 ${
                    isActive('left-middle')
                      ? 'fill-emerald-500 stroke-emerald-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                      : 'fill-emerald-100/90 dark:fill-emerald-950/50 stroke-emerald-300 dark:stroke-emerald-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="95" y={isActive('left-middle') ? 28 : 38} textAnchor="middle" className={`text-[10px] font-bold ${isActive('left-middle') ? 'fill-white' : 'fill-emerald-600 dark:fill-emerald-400'}`}>
                  D
                </text>
              </g>

              {/* Left Index */}
              <g className="cursor-default">
                <rect
                  x="114"
                  y={isActive('left-index') ? 20 : 30}
                  width="22"
                  height="80"
                  rx="11"
                  className={`transition-all duration-150 ${
                    isActive('left-index')
                      ? 'fill-cyan-500 stroke-cyan-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]'
                      : 'fill-cyan-100/90 dark:fill-cyan-950/50 stroke-cyan-300 dark:stroke-cyan-800'
                  }`}
                  strokeWidth="1.5"
                />
                {/* Bump dot for F key */}
                <circle cx="125" cy={isActive('left-index') ? 35 : 45} r="2.5" className={isActive('left-index') ? 'fill-white' : 'fill-cyan-600 dark:fill-cyan-400'} />
                <text x="125" y={isActive('left-index') ? 50 : 60} textAnchor="middle" className={`text-[10px] font-bold ${isActive('left-index') ? 'fill-white' : 'fill-cyan-600 dark:fill-cyan-400'}`}>
                  F
                </text>
              </g>

              {/* Left Thumb */}
              <g className="cursor-default">
                <rect
                  x="142"
                  y={isActive('left-thumb') ? 60 : 70}
                  width="20"
                  height="55"
                  rx="10"
                  transform="rotate(30 152 95)"
                  className={`transition-all duration-150 ${
                    isActive('left-thumb')
                      ? 'fill-purple-500 stroke-purple-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                      : 'fill-purple-100/90 dark:fill-purple-950/50 stroke-purple-300 dark:stroke-purple-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="160" y="85" textAnchor="middle" className={`text-[8px] font-bold ${isActive('left-thumb') ? 'fill-white' : 'fill-purple-600 dark:fill-purple-400'}`}>
                  ␣
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* RIGHT HAND */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
            {isBn ? 'ডান হাত (Right)' : 'Right Hand'}
          </div>

          <div className="relative w-40 sm:w-56 h-36 sm:h-44 flex justify-center items-end">
            {/* SVG Illustration of Right Hand */}
            <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-md">
              {/* Palm Base */}
              <path
                d="M 45 150 C 45 100, 60 85, 100 85 C 140 85, 155 100, 155 150 Z"
                className="fill-amber-100/70 dark:fill-slate-700/60 stroke-slate-300 dark:stroke-slate-600"
                strokeWidth="2"
              />

              {/* Right Thumb */}
              <g className="cursor-default">
                <rect
                  x="38"
                  y={isActive('right-thumb') ? 60 : 70}
                  width="20"
                  height="55"
                  rx="10"
                  transform="rotate(-30 48 95)"
                  className={`transition-all duration-150 ${
                    isActive('right-thumb')
                      ? 'fill-purple-500 stroke-purple-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                      : 'fill-purple-100/90 dark:fill-purple-950/50 stroke-purple-300 dark:stroke-purple-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="40" y="85" textAnchor="middle" className={`text-[8px] font-bold ${isActive('right-thumb') ? 'fill-white' : 'fill-purple-600 dark:fill-purple-400'}`}>
                  ␣
                </text>
              </g>

              {/* Right Index */}
              <g className="cursor-default">
                <rect
                  x="64"
                  y={isActive('right-index') ? 20 : 30}
                  width="22"
                  height="80"
                  rx="11"
                  className={`transition-all duration-150 ${
                    isActive('right-index')
                      ? 'fill-blue-500 stroke-blue-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]'
                      : 'fill-blue-100/90 dark:fill-blue-950/50 stroke-blue-300 dark:stroke-blue-800'
                  }`}
                  strokeWidth="1.5"
                />
                {/* Bump dot for J key */}
                <circle cx="75" cy={isActive('right-index') ? 35 : 45} r="2.5" className={isActive('right-index') ? 'fill-white' : 'fill-blue-600 dark:fill-blue-400'} />
                <text x="75" y={isActive('right-index') ? 50 : 60} textAnchor="middle" className={`text-[10px] font-bold ${isActive('right-index') ? 'fill-white' : 'fill-blue-600 dark:fill-blue-400'}`}>
                  J
                </text>
              </g>

              {/* Right Middle */}
              <g className="cursor-default">
                <rect
                  x="94"
                  y={isActive('right-middle') ? 10 : 20}
                  width="22"
                  height="88"
                  rx="11"
                  className={`transition-all duration-150 ${
                    isActive('right-middle')
                      ? 'fill-teal-500 stroke-teal-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(20,184,166,0.7)]'
                      : 'fill-teal-100/90 dark:fill-teal-950/50 stroke-teal-300 dark:stroke-teal-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="105" y={isActive('right-middle') ? 28 : 38} textAnchor="middle" className={`text-[10px] font-bold ${isActive('right-middle') ? 'fill-white' : 'fill-teal-600 dark:fill-teal-400'}`}>
                  K
                </text>
              </g>

              {/* Right Ring */}
              <g className="cursor-default">
                <rect
                  x="124"
                  y={isActive('right-ring') ? 18 : 28}
                  width="20"
                  height="80"
                  rx="10"
                  className={`transition-all duration-150 ${
                    isActive('right-ring')
                      ? 'fill-orange-500 stroke-orange-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]'
                      : 'fill-orange-100/90 dark:fill-orange-950/50 stroke-orange-300 dark:stroke-orange-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="134" y={isActive('right-ring') ? 35 : 45} textAnchor="middle" className={`text-[10px] font-bold ${isActive('right-ring') ? 'fill-white' : 'fill-orange-600 dark:fill-orange-400'}`}>
                  L
                </text>
              </g>

              {/* Right Pinky */}
              <g className="cursor-default">
                <rect
                  x="152"
                  y={isActive('right-pinky') ? 35 : 45}
                  width="18"
                  height="65"
                  rx="9"
                  className={`transition-all duration-150 ${
                    isActive('right-pinky')
                      ? 'fill-pink-500 stroke-pink-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]'
                      : 'fill-pink-100/90 dark:fill-pink-950/50 stroke-pink-300 dark:stroke-pink-800'
                  }`}
                  strokeWidth="1.5"
                />
                <text x="161" y={isActive('right-pinky') ? 50 : 60} textAnchor="middle" className={`text-[10px] font-bold ${isActive('right-pinky') ? 'fill-white' : 'fill-pink-600 dark:fill-pink-400'}`}>
                  ;
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
