import React from 'react';
import { Heart, Flame, Play, Crown } from 'lucide-react';
import { GameItem } from '../types.ts';

interface GameCardProps {
  game: GameItem;
  likes: number;
  isLiked?: boolean;
  onLikeToggle: (gameId: string) => void;
  onPlayGame: (game: GameItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  likes,
  isLiked = false,
  onLikeToggle,
  onPlayGame
}) => {
  return (
    <div
      onClick={() => onPlayGame(game)}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-amber-500/40 bg-[#1a1109] shadow-lg hover:shadow-amber-500/30 hover:border-amber-400 transition-all duration-200 cursor-pointer select-none active:scale-[0.97]"
    >
      {/* Game Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-950">
        <img
          src={game.image}
          alt={game.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover overlay with Play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
          </div>
        </div>

        {/* Top-Right Likes Pill */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle(game.id);
          }}
          className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-xs text-[10px] font-extrabold text-white hover:text-red-400 transition-colors shadow-sm"
        >
          <span>{likes}</span>
          <Heart
            className={`w-3 h-3 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        {/* Top-Left: Live / Play / Crown Icon */}
        {game.isLive && (
          <div className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full bg-black/60 border border-white/50 backdrop-blur-xs flex items-center justify-center text-white shadow-sm">
            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </div>
        )}

        {/* Bottom-Left: HOT Badge */}
        {game.isHot && (
          <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600/90 to-orange-600/90 text-white text-[9px] font-black tracking-wider uppercase shadow-md backdrop-blur-xs">
            <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>HOT</span>
          </div>
        )}
      </div>

      {/* Bottom Yellow-Gold Title & Provider Box */}
      <div className="bg-[#f3ad12] px-2 py-2 text-center flex flex-col justify-center min-h-[48px] border-t border-amber-400/50">
        <span className="text-[11px] sm:text-xs font-black tracking-tight text-stone-950 uppercase truncate leading-tight font-['Chakra_Petch']">
          {game.title}
        </span>
        <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-stone-900/90 uppercase truncate leading-tight mt-0.5">
          {game.provider}
        </span>
      </div>
    </div>
  );
};
