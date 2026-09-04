import React, { useRef } from 'react';
import { Home, Crown, Layers, Disc3, Trophy, Fish, ChevronLeft, ChevronRight } from 'lucide-react';

export type CategoryKey = 'lobby' | 'slot' | 'casino' | 'togel' | 'sports' | 'arcade';

interface NavigationProps {
  activeCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
}

const CATEGORIES = [
  { id: 'lobby', label: 'Lobby', icon: Home },
  { id: 'slot', label: 'Slot', icon: Crown },
  { id: 'casino', label: 'Live Casino', icon: Layers },
  { id: 'togel', label: 'Togel', icon: Disc3 },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'arcade', label: 'Fishing', icon: Fish },
] as const;

export const Navigation: React.FC<NavigationProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -150 : 150,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 my-2 select-none">
      <div className="flex items-center gap-1.5 bg-[#170f09] p-1.5 rounded-xl border border-amber-950/80 shadow-inner">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          aria-label="Scroll Kiri"
          className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 transition-colors shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 font-bold" />
        </button>

        {/* Scrollable Categories Row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as CategoryKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-150 shrink-0 shadow-sm cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                    : 'bg-[#261b12] hover:bg-[#34251a] text-amber-200/80 hover:text-amber-100 border border-amber-900/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          aria-label="Scroll Kanan"
          className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 transition-colors shadow-sm active:scale-95"
        >
          <ChevronRight className="w-5 h-5 font-bold" />
        </button>
      </div>
    </div>
  );
};
