import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TotoResultItem } from '../types.ts';

interface TotoHistoryProps {
  results: TotoResultItem[];
  onOpenTotoBet: (market: TotoResultItem) => void;
  showDivider?: boolean;
}

const DEFAULT_TOTO_ITEMS: TotoResultItem[] = [
  { id: '1', market: 'LOTTO GENTING 19', code: 'LG-19', result: '9398', time: '18:49:41', date: 'Hari Ini' },
  { id: '2', market: 'LOTTO GENTING 22', code: 'LG-22', result: '7229', time: '21:49:41', date: 'Hari Ini' },
  { id: '3', market: 'LOTTO GENTING 20', code: 'LG-20', result: '9880', time: '19:49:41', date: 'Hari Ini' },
  { id: '4', market: 'LOTTO GENTING 21', code: 'LG-21', result: '2176', time: '20:49:41', date: 'Hari Ini' },
];

export const TotoHistory: React.FC<TotoHistoryProps> = ({
  results,
  onOpenTotoBet,
  showDivider = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayResults = results && results.length > 0 ? results : DEFAULT_TOTO_ITEMS;

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
          <div className="w-6 h-6 rounded-full bg-[#f3ad12] text-stone-950 flex items-center justify-center font-black text-xs shadow-sm">
            8
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-wide text-white font-['Chakra_Petch']">
            Toto History
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

      {/* 4 Cards Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayResults.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenTotoBet(item)}
            className="group relative flex flex-col rounded-2xl overflow-hidden border border-amber-500/40 bg-[#121926] shadow-lg hover:border-amber-400 hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer min-w-[125px] sm:min-w-0 active:scale-[0.98]"
          >
            {/* Top Skyline Graphic Area */}
            <div className="relative h-28 sm:h-32 w-full flex flex-col items-center justify-between p-2 overflow-hidden bg-gradient-to-b from-[#14233c] via-[#0d1624] to-[#070d18]">
              {/* Twin Towers Silhouette simulation */}
              <div className="absolute bottom-0 inset-x-0 flex justify-center items-end gap-1 opacity-20 pointer-events-none">
                <div className="w-3 h-16 bg-sky-300 rounded-t-sm" />
                <div className="w-1 h-20 bg-sky-100" />
                <div className="w-4 h-24 bg-sky-400 rounded-t-sm" />
                <div className="w-1 h-20 bg-sky-100" />
                <div className="w-3 h-16 bg-sky-300 rounded-t-sm" />
              </div>

              {/* RESULT pill badge */}
              <div className="relative z-10 px-2.5 py-0.5 rounded-sm bg-gradient-to-r from-blue-700 to-sky-600 text-amber-200 text-[10px] font-black tracking-widest uppercase border border-sky-400/40 shadow">
                RESULT
              </div>

              {/* Huge 4D numbers in bright yellow */}
              <div className="relative z-10 text-3xl sm:text-4xl font-black text-[#facc15] font-['Chakra_Petch'] tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform">
                {item.result}
              </div>

              <div className="w-full"></div>
            </div>

            {/* Bottom Yellow Container */}
            <div className="relative bg-[#f3ad12] p-2 flex items-center gap-1.5 border-t border-amber-400/50">
              {/* Red Emblem Stamp */}
              <div className="w-7 h-7 rounded-full bg-red-600 border border-yellow-200 flex items-center justify-center shrink-0 shadow-sm text-yellow-200 font-black text-[9px]">
                通寶
              </div>

              {/* Time & Market Name */}
              <div className="flex flex-col flex-1 min-w-0 leading-none">
                <span className="text-[10px] font-black text-stone-950 font-mono">
                  {item.time}
                </span>
                <span className="text-[9px] sm:text-[10px] font-black text-stone-950 uppercase truncate mt-0.5">
                  {item.market}
                </span>
              </div>
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
