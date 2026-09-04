import React, { useState } from 'react';
import { X, Play, RefreshCw, Trophy, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameItem, UserProfile } from '../types.ts';

interface SlotGameModalProps {
  isOpen: boolean;
  game: GameItem | null;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenDeposit: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

const DEFAULT_GRID = [
  ['👑', '🍇', '💎', '7️⃣', '🍓'],
  ['💎', '👑', '⚡', '🍇', '💎'],
  ['🍓', '🍉', '👑', '💎', '⚡'],
];

const BET_AMOUNTS = [2000, 5000, 10000, 25000, 50000];

export const SlotGameModal: React.FC<SlotGameModalProps> = ({
  isOpen,
  game,
  user,
  onClose,
  onOpenLogin,
  onOpenDeposit,
  onBalanceUpdate
}) => {
  const [bet, setBet] = useState(5000);
  const [grid, setGrid] = useState<string[][]>(DEFAULT_GRID);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [winMessage, setWinMessage] = useState<string>('');

  if (!isOpen || !game) return null;

  const handleSpin = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }

    if (user.balance < bet) {
      setWinMessage('Saldo tidak cukup, silakan deposit terlebih dahulu');
      return;
    }

    setIsSpinning(true);
    setWinMessage('');
    setLastWin(0);

    // Fast animation visual shuffle
    const shuffleInterval = setInterval(() => {
      const symbols = ['🍇', '🍉', '🍌', '🍓', '💎', '👑', '⚡', '7️⃣'];
      setGrid(
        Array.from({ length: 3 }, () =>
          Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)])
        )
      );
    }, 100);

    try {
      const res = await fetch('/api/games/slot-spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameId: game.id,
          betAmount: bet
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memutar slot');

      setTimeout(() => {
        clearInterval(shuffleInterval);
        setGrid(data.grid);
        setIsSpinning(false);
        setLastWin(data.winAmount);
        setWinMessage(data.winMessage);
        onBalanceUpdate(data.newBalance);

        if (data.winAmount > 0) {
          confetti({
            particleCount: data.winAmount > bet * 5 ? 120 : 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }, 1200);
    } catch (err: any) {
      clearInterval(shuffleInterval);
      setIsSpinning(false);
      setWinMessage(err.message || 'Terjadi kesalahan sistem');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-[#1a120b] border-2 border-amber-500 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-4 sm:p-6 overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1e14] text-amber-400 hover:text-white border border-amber-900/50 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/50 shadow">
              <img
                src={game.image}
                alt={game.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-300 font-['Chakra_Petch']">
                  {game.title}
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-amber-500 text-stone-950">
                  {game.provider}
                </span>
              </div>
              <span className="text-[11px] text-amber-200/70">
                RTP Live {game.rtp || 98.6}% Gacor Hari Ini
              </span>
            </div>
          </div>

          <div className="mr-8 text-right">
            <span className="text-[10px] text-amber-300/80 block">Saldo Akun:</span>
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
              Rp {user ? user.balance.toLocaleString('id-ID') : '0'}
            </span>
          </div>
        </div>

        {/* Slot Grid Arena */}
        <div className="my-4 p-3 rounded-2xl bg-gradient-to-b from-[#24170d] via-[#1a0f07] to-[#120a05] border border-amber-500/40 shadow-inner">
          <div className="grid grid-rows-3 gap-2">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-5 gap-2">
                {row.map((sym, cIdx) => (
                  <div
                    key={cIdx}
                    className={`aspect-square rounded-xl bg-[#2e1d0f] border border-amber-900/60 shadow-md flex items-center justify-center text-3xl sm:text-4xl transition-all duration-150 ${
                      isSpinning ? 'animate-pulse scale-95 opacity-80' : 'scale-100'
                    }`}
                  >
                    {sym}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Status & Win Feedback */}
        <div className="min-h-[28px] flex items-center justify-center text-center mb-2">
          {lastWin > 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm sm:text-base animate-bounce">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{winMessage} (+Rp {lastWin.toLocaleString('id-ID')})</span>
            </div>
          ) : winMessage ? (
            <span className="text-xs font-bold text-amber-300/80">{winMessage}</span>
          ) : (
            <span className="text-[11px] text-amber-400/60">Pasang taruhan lalu tekan SPIN untuk memutar</span>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Bet selector */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-amber-200">Taruhan per Spin:</span>
              <span className="text-xs font-mono font-black text-amber-300">
                Rp {bet.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {BET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => setBet(amt)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bet === amt
                      ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                      : 'bg-[#24170d] text-amber-200 border border-amber-900/40 hover:bg-[#311f12]'
                  }`}
                >
                  {(amt / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
            </div>
          </div>

          {/* Spin Action Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-base tracking-wider uppercase shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'MEMUTAR...' : user ? `SPIN (RP ${bet.toLocaleString('id-ID')})` : 'LOGIN UNTUK SPIN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
