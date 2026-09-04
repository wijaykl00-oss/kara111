import React, { useRef } from 'react';
import { Disc3, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { TotoResultItem } from '../types.ts';

interface TotoHistoryProps {
  results: TotoResultItem[];
  onOpenTotoBet: (market: TotoResultItem) => void;
}

export const TotoHistory: React.FC<TotoHistoryProps> = ({
  results,
  onOpenTotoBet
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
          <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs">
            8
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-50">
            Toto History
          </h2>
        </div>

        {/* Arrows */}
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

      {/* 4 Cards Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {results.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenTotoBet(item)}
            className="group relative flex flex-col rounded-xl overflow-hidden border border-amber-900/50 bg-[#121926] shadow-md hover:border-amber-400 hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer min-w-[125px] sm:min-w-0 active:scale-[0.98]"
          >
            {/* Top Skyline Graphic Area */}
            <div className="relative h-24 sm:h-28 w-full flex flex-col items-center justify-between p-2 overflow-hidden bg-gradient-to-b from-[#14233c] via-[#0e1626] to-[#0a101b]">
              {/* Skyline graphic effect */}
              <div className="absolute inset-x-0 bottom-0 h-16 opacity-35 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.3),transparent_70%)] pointer-events-none" />
              {/* City tower silhouette simulation */}
              <div className="absolute bottom-0 inset-x-2 flex justify-center items-end gap-1 opacity-25 pointer-events-none">
                <div className="w-2.5 h-12 bg-sky-300 rounded-t-sm" />
                <div className="w-1 h-14 bg-sky-200" />
                <div className="w-3.5 h-16 bg-sky-400 rounded-t-sm" />
                <div className="w-1 h-14 bg-sky-200" />
                <div className="w-2.5 h-12 bg-sky-300 rounded-t-sm" />
              </div>

              {/* RESULT pill badge */}
              <div className="relative z-10 px-2.5 py-0.5 rounded-sm bg-gradient-to-r from-blue-700 to-sky-600 text-amber-200 text-[10px] font-black tracking-widest uppercase border border-sky-400/40 shadow">
                RESULT
              </div>

              {/* Huge 4D numbers */}
              <div className="relative z-10 text-2xl sm:text-3xl font-black text-amber-400 font-['Chakra_Petch'] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform">
                {item.result}
              </div>

              <div className="w-full"></div>
            </div>

            {/* Bottom Yellow Container */}
            <div className="relative bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 p-1.5 flex items-center gap-1.5">
              {/* Red Emblem Stamp */}
              <div className="w-7 h-7 rounded-full bg-red-600 border border-yellow-200 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white text-[10px] font-black">通寶</span>
              </div>

              {/* Time & Market Name */}
              <div className="flex flex-col flex-1 min-w-0 leading-none">
                <span className="text-[9px] font-bold text-amber-950 font-mono">
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
    </section>
  );
};
