import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { CASINO_PROVIDERS, CasinoProviderItem } from '../data/games.ts';

interface LiveCasinoSectionProps {
  onSelectCasino: (provider: CasinoProviderItem) => void;
  showDivider?: boolean;
}

export const LiveCasinoSection: React.FC<LiveCasinoSectionProps> = ({
  onSelectCasino,
  showDivider = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-3 my-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Card Icon */}
          <span className="text-xl">🎴</span>
          <h2 className="text-lg sm:text-xl font-black tracking-wide text-white font-['Chakra_Petch']">
            Live Casino
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll Kiri"
            className="w-8 h-8 rounded-lg bg-[#f3ad12] hover:bg-yellow-400 text-stone-950 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer font-black"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll Kanan"
            className="w-8 h-8 rounded-lg bg-[#f3ad12] hover:bg-yellow-400 text-stone-950 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer font-black"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 8 Casino Dealer Cards in 4x2 Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {CASINO_PROVIDERS.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectCasino(item)}
            className="group relative flex flex-col rounded-2xl overflow-hidden border border-amber-900/60 bg-[#281c12] shadow-lg hover:border-amber-400 hover:shadow-amber-500/30 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            {/* Dealer Image Area */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#24170d]">
              <img
                src={item.dealerImg}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Top Logo / Brand Title */}
              <div className="absolute inset-x-0 top-0 pt-2 pb-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex flex-col items-center justify-center px-1">
                <span className="text-[10px] sm:text-xs font-black tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-center font-['Chakra_Petch'] leading-tight">
                  {item.name}
                </span>
              </div>

              {/* Hover Play Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-4 h-4 fill-stone-950 ml-0.5" />
                </div>
              </div>

              {/* Bottom Yellow Accent Bar from Screenshot */}
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#f3ad12]" />
            </div>
          </div>
        ))}
      </div>

      {showDivider && (
        <div className="mt-5 border-b border-stone-800/80" />
      )}
    </section>
  );
};
