import React, { useState, useEffect, useRef } from 'react';
import { X, Rocket, Trophy, Play, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types.ts';

interface SpacemanGameModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenDeposit: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

const BET_PRESETS = [5000, 10000, 25000, 50000, 100000];

export const SpacemanGameModal: React.FC<SpacemanGameModalProps> = ({
  isOpen,
  user,
  onClose,
  onOpenLogin,
  onOpenDeposit,
  onBalanceUpdate
}) => {
  const [betAmount, setBetAmount] = useState<number>(10000);
  const [gameState, setGameState] = useState<'IDLE' | 'FLYING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(2.5);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  if (!isOpen) return null;

  const handleStartFlight = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }

    if (user.balance < betAmount) {
      setStatusMessage('Saldo Anda tidak mencukupi, silakan lakukan Deposit terlebih dahulu');
      return;
    }

    // Deduct bet from balance immediately
    setGameState('FLYING');
    setMultiplier(1.0);
    setStatusMessage('');
    setWinAmount(0);

    // Call API to deduct and get predetermined crash point
    try {
      const res = await fetch('/api/games/spaceman-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          betAmount,
          cashoutMultiplier: 999 // We will handle dynamic cashout on client
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Server generated crash point
      const generatedCrash = Math.max(1.15, data.crashPoint || 2.2);
      setCrashPoint(generatedCrash);
      onBalanceUpdate(data.newBalance);

      startTimeRef.current = performance.now();

      const animate = (now: number) => {
        const elapsed = (now - startTimeRef.current) / 1000;
        // Exponential flight multiplier
        const currentMult = Number((1.0 + Math.pow(elapsed * 0.8, 1.6)).toFixed(2));

        if (currentMult >= generatedCrash) {
          setMultiplier(generatedCrash);
          setGameState('CRASHED');
          setStatusMessage(`CRASHED PADA ${generatedCrash}x! Astronaut terbang terlalu jauh.`);
        } else {
          setMultiplier(currentMult);
          animRef.current = requestAnimationFrame(animate);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    } catch (e: any) {
      setGameState('IDLE');
      setStatusMessage(e.message || 'Gagal memulai permainan');
    }
  };

  const handleCashout = async () => {
    if (gameState !== 'FLYING' || !user) return;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const currentCashMult = multiplier;
    const calculatedWin = Math.round(betAmount * currentCashMult);

    setGameState('CASHED_OUT');
    setWinAmount(calculatedWin);
    setStatusMessage(`BERHASIL CASHOUT PADA ${currentCashMult.toFixed(2)}x! +Rp ${calculatedWin.toLocaleString('id-ID')}`);

    // Update balance on server
    try {
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: calculatedWin,
          bankName: 'SPACEMAN WIN',
          notes: `Menang Spaceman Multiplier ${currentCashMult.toFixed(2)}x`
        })
      });
      const data = await res.json();
      if (data.newBalance) {
        onBalanceUpdate(data.newBalance);
      }

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-[#140c1d] border-2 border-purple-500/60 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] p-4 sm:p-6 overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1738] text-purple-300 hover:text-white border border-purple-800/60 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300">
              <Rocket className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-amber-300 font-['Chakra_Petch']">
                  SPACEMAN
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 text-purple-200 font-extrabold border border-purple-600/50">
                  Pragmatic Play
                </span>
              </div>
              <span className="text-xs text-purple-200/70">
                Turnamen Perkalian 5000x Maxwin
              </span>
            </div>
          </div>

          <div className="mr-8 text-right">
            <span className="text-[10px] text-purple-300/80 block">Saldo Akun:</span>
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
              Rp {user ? user.balance.toLocaleString('id-ID') : '0'}
            </span>
          </div>
        </div>

        {/* Flight Display Arena */}
        <div className="relative my-4 h-56 sm:h-64 rounded-2xl border border-purple-700/50 bg-gradient-to-b from-[#0b0416] via-[#1a082b] to-[#250b3e] overflow-hidden flex flex-col items-center justify-center">
          {/* Cosmic Background Stars & Nebulas */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
          <div className="absolute top-6 left-12 w-16 h-16 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-6 right-12 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

          {/* Flying Astronaut Graphic */}
          <div
            className={`relative z-10 transition-transform duration-100 ${
              gameState === 'FLYING' ? 'animate-pulse' : ''
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 border-2 border-white/80 shadow-2xl flex items-center justify-center text-4xl transform hover:scale-105">
              {gameState === 'CRASHED' ? '💥' : gameState === 'CASHED_OUT' ? '🏆' : '👨‍🚀'}
            </div>
          </div>

          {/* Multiplier Display */}
          <div className="relative z-10 mt-3 flex flex-col items-center">
            <span
              className={`text-4xl sm:text-5xl font-black font-['Chakra_Petch'] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${
                gameState === 'CRASHED'
                  ? 'text-rose-500'
                  : gameState === 'CASHED_OUT'
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {multiplier.toFixed(2)}x
            </span>

            {gameState === 'FLYING' && (
              <span className="text-xs font-bold text-cyan-300 mt-1">
                Astronaut Terbang Tinggi...
              </span>
            )}
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`absolute bottom-3 inset-x-4 p-2 rounded-lg text-center text-xs font-bold border ${
                gameState === 'CASHED_OUT'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500 text-rose-300'
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>

        {/* Betting Controls & Cashout Button */}
        <div className="space-y-3">
          {/* Bet Presets */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-purple-200">Jumlah Taruhan:</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                Rp {betAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {BET_PRESETS.map((amt) => (
                <button
                  key={amt}
                  disabled={gameState === 'FLYING'}
                  onClick={() => setBetAmount(amt)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    betAmount === amt
                      ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                      : 'bg-[#2a1738] text-purple-200 border border-purple-800/40 hover:bg-[#3d2052]'
                  }`}
                >
                  {(amt / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger: START BET or CASH OUT */}
          <div className="pt-1">
            {gameState === 'FLYING' ? (
              <button
                onClick={handleCashout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-300 hover:to-green-400 text-stone-950 font-black text-base tracking-wider uppercase shadow-xl shadow-green-900/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Trophy className="w-5 h-5 text-stone-950" />
                <span>
                  CASHOUT SEKARANG (Rp {(betAmount * multiplier).toLocaleString('id-ID')})
                </span>
              </button>
            ) : (
              <button
                onClick={handleStartFlight}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-base tracking-wider uppercase shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 text-stone-950 fill-stone-950" />
                <span>
                  {user ? `PASANG TARUHAN & TERBANG (RP ${betAmount.toLocaleString('id-ID')})` : 'LOGIN UNTUK BERMAIN'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
