import React from 'react';
import { Gift } from 'lucide-react';

interface SpinWheelBannerProps {
  onOpenWheel: () => void;
  isLoggedIn: boolean;
}

export const SpinWheelBanner: React.FC<SpinWheelBannerProps> = ({
  onOpenWheel,
  isLoggedIn
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-3 my-4 select-none">
      <div
        onClick={onOpenWheel}
        className="relative overflow-hidden rounded-2xl border border-amber-900/60 bg-[#24170d] p-4 sm:p-5 shadow-xl hover:border-amber-400 hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group"
      >
        {/* Left Text & CTA Button */}
        <div className="relative z-10 flex flex-col items-start text-left max-w-md">
          <h3 className="text-base sm:text-lg font-black text-amber-400 font-['Chakra_Petch'] uppercase tracking-tight leading-tight">
            PUTAR RODA NYA
          </h3>
          <h3 className="text-base sm:text-lg font-black text-amber-400 font-['Chakra_Petch'] uppercase tracking-tight leading-tight">
            DAN DAPATKAN HADIAHNYA
          </h3>

          <p className="text-xs text-stone-300 mt-1 font-medium">
            Menangkan Jutaan Rupiah Hanya 1x Klik
          </p>

          <button
            type="button"
            className="mt-3 px-4 py-1.5 rounded-lg bg-[#140b05] hover:bg-[#201309] text-amber-100 font-bold text-xs tracking-wider border border-amber-900/60 shadow-md group-hover:border-amber-500/60 transition-all active:scale-95"
          >
            {isLoggedIn ? 'Putar Sekarang' : 'Daftar Sekarang'}
          </button>
        </div>

        {/* Right 3D Wheel & Treasure Chest with Gold Coins */}
        <div className="relative z-10 flex items-center justify-center shrink-0 pr-2">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* Multi-color Segments Wheel */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-amber-400 shadow-2xl relative overflow-hidden bg-conic-gradient flex items-center justify-center animate-[spin_16s_linear_infinite]"
              style={{
                background: 'conic-gradient(#ef4444 0deg 60deg, #10b981 60deg 120deg, #06b6d4 120deg 180deg, #f59e0b 180deg 240deg, #8b5cf6 240deg 300deg, #ec4899 300deg 360deg)'
              }}
            >
              <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-stone-900 flex items-center justify-center text-[8px] font-black text-stone-950 shadow">
                SPIN
              </div>
            </div>

            {/* Treasure Chest & Flying Gold Coins */}
            <div className="absolute -bottom-1 -right-2 bg-gradient-to-tr from-amber-700 to-yellow-500 rounded-lg p-1.5 border border-yellow-300 shadow-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl leading-none">🪙</span>
            </div>
            {/* Flying gold coin */}
            <div className="absolute top-2 -left-2 text-base animate-bounce">
              ✨
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
