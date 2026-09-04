import React, { useState, useRef } from 'react';
import { X, Sparkles, Gift, Disc } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types.ts';

interface LuckyWheelModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

const PRIZES = [
  { label: 'Rp 5.000', color: '#f59e0b', textColor: '#000' },
  { label: 'Rp 50.000', color: '#dc2626', textColor: '#fff' },
  { label: 'Rp 10.000', color: '#10b981', textColor: '#000' },
  { label: 'ZONK', color: '#374151', textColor: '#fff' },
  { label: 'Rp 25.000', color: '#8b5cf6', textColor: '#fff' },
  { label: 'Rp 100.000', color: '#eab308', textColor: '#000' },
];

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  user,
  onClose,
  onOpenLogin,
  onBalanceUpdate
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSpin = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setWinMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/games/spin-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memutar roda');

      // Find slice index
      let targetIndex = 0;
      if (data.amount === 5000) targetIndex = 0;
      else if (data.amount === 50000) targetIndex = 1;
      else if (data.amount === 10000) targetIndex = 2;
      else if (data.amount === 0) targetIndex = 3;
      else if (data.amount === 25000) targetIndex = 4;
      else if (data.amount === 100000) targetIndex = 5;

      const sliceAngle = 360 / PRIZES.length;
      // Calculate target angle to land on targetIndex slice (pointing at top indicator: 270 deg or pointer at 0)
      const extraSpins = 360 * 5; // 5 full rotations
      const targetAngle = extraSpins + (360 - targetIndex * sliceAngle - sliceAngle / 2);

      setRotation((prev) => prev + targetAngle);

      setTimeout(() => {
        setIsSpinning(false);
        setWinMessage(data.message);
        onBalanceUpdate(data.balance);

        if (data.amount > 0) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }, 4500);
    } catch (err: any) {
      setIsSpinning(false);
      setWinMessage(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-[#1a120b] border-2 border-amber-500 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.3)] p-4 sm:p-6 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1e14] text-amber-400 hover:text-white border border-amber-900/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            KARA111 LUCKY WHEEL
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-['Chakra_Petch']">
            RODA KEBERUNTUNGAN
          </h2>
          <p className="text-xs text-amber-200/80">
            Putar dan raih bonus saldo langsung masuk ke dompet Anda!
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30 filter drop-shadow-md">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400" />
          </div>

          {/* Outer Wheel Rim */}
          <div className="w-full h-full rounded-full border-[8px] border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.4)] p-1 bg-stone-950 flex items-center justify-center">
            {/* Spinning Disk */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4500ms] ease-out shadow-inner"
              style={{
                transform: `rotate(${rotation}deg)`
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {PRIZES.map((prize, idx) => {
                  const angle = 360 / PRIZES.length;
                  const startAngle = (idx * angle * Math.PI) / 180;
                  const endAngle = (((idx + 1) * angle) * Math.PI) / 180;

                  const x1 = 50 + 50 * Math.cos(startAngle);
                  const y1 = 50 + 50 * Math.sin(startAngle);
                  const x2 = 50 + 50 * Math.cos(endAngle);
                  const y2 = 50 + 50 * Math.sin(endAngle);

                  const path = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  const textAngle = idx * angle + angle / 2;

                  return (
                    <g key={idx}>
                      <path d={path} fill={prize.color} stroke="#1a120b" strokeWidth="0.8" />
                      <g transform={`rotate(${textAngle}, 50, 50)`}>
                        <text
                          x="75"
                          y="51.5"
                          fill={prize.textColor}
                          fontSize="5"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontFamily="sans-serif"
                        >
                          {prize.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Center Cap */}
              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-white shadow-xl flex items-center justify-center text-stone-950 font-black text-xs">
                ★
              </div>
            </div>
          </div>
        </div>

        {/* Win Message / Result */}
        {winMessage && (
          <div className="w-full mt-3 p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-center animate-bounce">
            <span className="text-xs sm:text-sm font-black text-amber-300">
              {winMessage}
            </span>
          </div>
        )}

        {/* Spin Button */}
        <div className="w-full mt-4">
          <button
            onClick={handleSpin}
            disabled={isSpinning || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-5 h-5 text-stone-950" />
            <span>
              {isSpinning
                ? 'SEDANG MEMUTAR...'
                : user
                ? 'PUTAR RODA SEKARANG'
                : 'LOGIN UNTUK MEMUTAR'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
