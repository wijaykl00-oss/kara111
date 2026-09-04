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
  showDivider?: boolean;
}

export const GamesSection: React.FC<GamesSectionProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-amber-400',
  games,
  likesMap,
  userFavorites,
  onLikeToggle,
  onPlayGame,
  showDivider = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.9;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-3 my-4 select-none">
      {/* Section Header with Title & Arrow Buttons */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-6 h-6 ${iconColor} fill-current`} />
          <h2 className="text-lg sm:text-xl font-black tracking-wide text-white font-['Chakra_Petch']">
            {title}
          </h2>
        </div>

        {/* Navigation Arrows (Yellow Gold Background with Dark Chevron from Screenshot) */}
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

      {/* Smooth Horizontal Scrollable Cards Row */}
      <div
        ref={containerRef}
        className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="w-[130px] sm:w-[calc(25%-9px)] min-w-[125px] sm:min-w-[170px] shrink-0 snap-start"
          >
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

      {/* Horizontal Divider Line between sections */}
      {showDivider && (
        <div className="mt-4 border-b border-stone-800/80" />
      )}
    </section>
  );
};
