import React from 'react';
import { Heart, Flame, Play } from 'lucide-react';
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
      className="group relative flex flex-col rounded-xl overflow-hidden border border-amber-900/40 bg-[#1f150d] shadow-md hover:shadow-amber-500/20 hover:border-amber-500/60 transition-all duration-200 cursor-pointer select-none active:scale-[0.97]"
    >
      {/* Game Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-900">
        <img
          src={game.image}
          alt={game.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />

        {/* Dark subtle overlay on hover with Play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between z-10">
          {/* Left badge: HOT or Play icon */}
          {game.isHot ? (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-black tracking-wider uppercase shadow backdrop-blur-xs">
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>HOT</span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-amber-300">
              <Play className="w-2.5 h-2.5 fill-amber-300" />
            </div>
          )}

          {/* Right badge: Likes count + Heart */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLikeToggle(game.id);
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white hover:text-red-400 transition-colors"
          >
            <span>{likes}</span>
            <Heart
              className={`w-3 h-3 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-white/80'
              }`}
            />
          </button>
        </div>

        {/* Optional RTP badge if available */}
        {game.rtp && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-300 font-bold">
            RTP {game.rtp}%
          </div>
        )}
      </div>

      {/* Bottom Yellow Label: Title + Provider */}
      <div className="bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 px-2 py-1.5 text-center flex flex-col justify-center min-h-[46px]">
        <span className="text-[11px] sm:text-xs font-black tracking-tight text-stone-950 uppercase truncate leading-tight">
          {game.title}
        </span>
        <span className="text-[8px] sm:text-[9px] font-extrabold tracking-wider text-amber-950 uppercase truncate leading-tight">
          {game.provider}
        </span>
      </div>
    </div>
  );
};
