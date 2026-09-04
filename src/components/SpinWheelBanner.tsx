import React from 'react';
import { Sparkles, Disc, Gift } from 'lucide-react';

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
        className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-r from-[#2a1708] via-[#3a1f0a] to-[#241205] p-4 sm:p-5 shadow-xl hover:border-amber-400 hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group"
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-yellow-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Left Text & CTA Button */}
        <div className="relative z-10 flex flex-col items-start text-left">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30 mb-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Event Harian Member</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-amber-300 font-['Chakra_Petch'] uppercase tracking-tight drop-shadow">
            PUTAR RODA NYA DAN DAPATKAN HADIAHNYA
          </h3>

          <p className="text-xs sm:text-sm font-semibold text-amber-100/90 mt-0.5">
            Menangkan Jutaan Rupiah Hanya 1x Klik
          </p>

          <button
            type="button"
            className="mt-3 px-5 py-2 rounded-lg bg-[#271d15] hover:bg-[#382a1d] text-amber-300 font-black text-xs sm:text-sm tracking-wider uppercase border border-amber-500/60 shadow-md group-hover:bg-amber-500 group-hover:text-stone-950 transition-all active:scale-95 flex items-center gap-2"
          >
            <Gift className="w-4 h-4 text-amber-400 group-hover:text-stone-950" />
            <span>{isLoggedIn ? 'Putar Sekarang' : 'Daftar Sekarang'}</span>
          </button>
        </div>

        {/* Right 3D Wheel & Treasure Graphic */}
        <div className="relative z-10 flex items-center justify-center shrink-0">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* Spinning Wheel Graphic */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-400 shadow-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 animate-[spin_12s_linear_infinite] flex items-center justify-center">
              {/* Segments simulation */}
              <div className="w-full h-full rounded-full border-[6px] border-amber-200/50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-stone-950 border-2 border-amber-300 flex items-center justify-center text-[10px] font-black text-amber-400">
                  ★
                </div>
              </div>
            </div>

            {/* Treasure Chest & Coin Cluster Embellishment */}
            <div className="absolute -bottom-1 -right-2 text-2xl sm:text-3xl filter drop-shadow-md">
              💰
            </div>
            <div className="absolute -top-1 -left-1 text-xl filter drop-shadow-md">
              👑
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
