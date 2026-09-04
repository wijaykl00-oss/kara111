import React, { useState } from 'react';
import { X, Disc3, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { TotoResultItem, UserProfile } from '../types.ts';

interface TotoBetModalProps {
  isOpen: boolean;
  market: TotoResultItem | null;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

export const TotoBetModal: React.FC<TotoBetModalProps> = ({
  isOpen,
  market,
  user,
  onClose,
  onOpenLogin,
  onBalanceUpdate
}) => {
  const [betType, setBetType] = useState<'4D' | '3D' | '2D' | 'Colok Bebas'>('4D');
  const [numbers, setNumbers] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !market) return null;

  const multiplier = betType === '4D' ? 3000 : betType === '3D' ? 400 : betType === '2D' ? 70 : 1.5;
  const potentialWin = amount * multiplier;

  const handleBetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }

    if (!numbers) {
      setMessage({ type: 'error', text: 'Harap masukkan nomor tebakan Anda' });
      return;
    }

    if (betType === '4D' && numbers.length !== 4) {
      setMessage({ type: 'error', text: 'Taruhan 4D harus berisi 4 digit angka (contoh: 8821)' });
      return;
    }
    if (betType === '3D' && numbers.length !== 3) {
      setMessage({ type: 'error', text: 'Taruhan 3D harus berisi 3 digit angka (contoh: 821)' });
      return;
    }
    if (betType === '2D' && numbers.length !== 2) {
      setMessage({ type: 'error', text: 'Taruhan 2D harus berisi 2 digit angka (contoh: 21)' });
      return;
    }

    if (user.balance < amount) {
      setMessage({ type: 'error', text: 'Saldo Anda tidak mencukupi untuk memasang nomor ini' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/togel/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          market: market.market,
          betType,
          numbers,
          amount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memasang taruhan');

      setMessage({
        type: 'success',
        text: `Taruhan ${betType} [${numbers}] di ${market.market} berhasil dipasang!`
      });
      onBalanceUpdate(data.newBalance);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-[#1a120b] border border-amber-500/50 rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1e14] text-amber-400 hover:text-white border border-amber-900/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-900/40">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm shadow">
            8
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-300 font-['Chakra_Petch']">
              PASANG TOGEL - {market.market}
            </h2>
            <p className="text-[11px] text-amber-200/70">
              Result Terakhir: {market.result} ({market.time})
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-2.5 mb-3 rounded-lg text-xs font-medium border ${
              message.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                : 'bg-red-950/70 border-red-700 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleBetSubmit} className="space-y-3">
          {/* Bet Type Selection */}
          <div>
            <label className="text-xs font-bold text-amber-200 block mb-1">
              Pilih Jenis Taruhan
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['4D', '3D', '2D', 'Colok Bebas'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setBetType(t);
                    setNumbers('');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    betType === t
                      ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                      : 'bg-[#24170d] text-amber-200 border border-amber-900/40 hover:bg-[#311f12]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Numbers Input */}
          <div>
            <label className="text-xs font-bold text-amber-200 block mb-1">
              Nomor Tebakan ({betType})
            </label>
            <input
              type="text"
              required
              value={numbers}
              maxLength={betType === '4D' ? 4 : betType === '3D' ? 3 : betType === '2D' ? 2 : 1}
              onChange={(e) => setNumbers(e.target.value.replace(/\D/g, ''))}
              placeholder={betType === '4D' ? 'Contoh: 9398' : betType === '3D' ? 'Contoh: 398' : 'Contoh: 98'}
              className="w-full bg-[#1b1008] border border-amber-900/60 rounded-xl px-3 py-2 text-center text-xl tracking-[0.25em] font-mono text-amber-300 font-black focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Nominal Presets */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-amber-200">Jumlah Taruhan:</label>
              <span className="text-xs font-mono font-bold text-amber-400">
                Rp {amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1000, 5000, 10000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    amount === amt
                      ? 'bg-amber-400 text-stone-950 font-black'
                      : 'bg-[#24170d] text-amber-200 border border-amber-900/40'
                  }`}
                >
                  {(amt / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
            </div>
          </div>

          {/* Potential Win Banner */}
          <div className="p-3 rounded-xl bg-[#24170d] border border-amber-800/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-200">Potensi Kemenangan ({multiplier}x):</span>
            </div>
            <span className="text-sm font-black text-amber-300 font-mono">
              Rp {potentialWin.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-sm tracking-wider uppercase shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'MEMPROSES...' : user ? `PASANG NOMOR (RP ${amount.toLocaleString('id-ID')})` : 'LOGIN UNTUK MEMASANG'}
          </button>
        </form>
      </div>
    </div>
  );
};
