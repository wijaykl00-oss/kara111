import React, { useRef } from 'react';
import { Layers, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { CASINO_PROVIDERS, CasinoProviderItem } from '../data/games.ts';

interface LiveCasinoSectionProps {
  onSelectCasino: (provider: CasinoProviderItem) => void;
}

export const LiveCasinoSection: React.FC<LiveCasinoSectionProps> = ({
  onSelectCasino
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
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-50">
            Live Casino
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll Kiri"
            className="w-7 h-7 rounded-md bg-[#2b1e14] hover:bg-amber-500 hover:text-stone-950 text-amber-400 border border-amber-900/40 flex items-center justify-center transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 font-bold" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll Kanan"
            className="w-7 h-7 rounded-md bg-[#2b1e14] hover:bg-amber-500 hover:text-stone-950 text-amber-400 border border-amber-900/40 flex items-center justify-center transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 font-bold" />
          </button>
        </div>
      </div>

      {/* Grid of 8 Casino Dealers (2 rows of 4 or 4 columns scrollable) */}
      <div
        ref={containerRef}
        className="grid grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CASINO_PROVIDERS.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectCasino(item)}
            className="group relative flex flex-col rounded-xl overflow-hidden border border-amber-950/80 bg-[#1f150d] shadow-md hover:border-amber-400 hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer min-w-[125px] sm:min-w-0 active:scale-[0.98]"
          >
            {/* Dealer Image Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-900">
              <img
                src={item.dealerImg}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Top Logo / Brand Overlay */}
              <div className="absolute inset-x-0 top-0 p-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-black tracking-wider text-amber-200 uppercase drop-shadow text-center">
                  {item.name}
                </span>
                <span className="text-[8px] font-bold text-amber-400/80 uppercase">
                  Live Table
                </span>
              </div>

              {/* Bottom Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
