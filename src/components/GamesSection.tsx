import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { GameItem } from '../types.ts';
import { GameCard } from './GameCard.tsx';

interface GamesSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  games: GameItem[];
  likesMap: Record<string, number>;
  userFavorites: string[];
  onLikeToggle: (gameId: string) => void;
  onPlayGame: (game: GameItem) => void;
}

export const GamesSection: React.FC<GamesSectionProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-amber-400',
  games,
  likesMap,
  userFavorites,
  onLikeToggle,
  onPlayGame
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
      {/* Section Header with Title & Arrow Buttons */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-50">
            {title}
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

      {/* 4 Cards Grid / Horizontal Scroll for Mobile */}
      <div
        ref={containerRef}
        className="grid grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game) => (
          <div key={game.id} className="min-w-[120px] sm:min-w-0">
            <GameCard
              game={game}
              likes={likesMap[game.id] ?? game.likes}
              isLiked={userFavorites.includes(game.id)}
              onLikeToggle={onLikeToggle}
              onPlayGame={onPlayGame}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
