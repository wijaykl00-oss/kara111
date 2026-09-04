import React, { useState } from 'react';
import { X, ArrowUpRight, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface WithdrawModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onWithdrawSuccess: (newBalance: number) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  user,
  onClose,
  onWithdrawSuccess
}) => {
  const [amount, setAmount] = useState<string>('50000');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount < 25000) {
      setMessage({ type: 'error', text: 'Minimal penarikan dana adalah Rp 25.000' });
      return;
    }

    if (numAmount > user.balance) {
      setMessage({ type: 'error', text: 'Saldo akun tidak mencukupi untuk jumlah penarikan ini' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: numAmount,
          notes: notes || `Withdraw to ${user.bankName} - ${user.accountNumber}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses withdraw');
      }

      setMessage({
        type: 'success',
        text: `Penarikan Rp ${numAmount.toLocaleString('id-ID')} berhasil diproses dan dikirimkan ke rekening ${user.bankName} Anda.`
      });

      setTimeout(() => {
        onWithdrawSuccess(data.newBalance);
        onClose();
      }, 1500);
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
          <div className="w-10 h-10 rounded-full bg-[#3a2717] border border-amber-600/50 flex items-center justify-center text-amber-300 font-black shadow">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-amber-300 font-['Chakra_Petch']">
              TARIK DANA (WITHDRAW)
            </h2>
            <p className="text-[11px] text-amber-200/70">
              Pengiriman kilat 24 jam langsung ke rekening Anda
            </p>
          </div>
        </div>

        {/* Current Balance Banner */}
        <div className="flex items-center justify-between bg-[#24170d] p-3 rounded-xl border border-amber-900/50 mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-200/80">Saldo Tersedia:</span>
          </div>
          <span className="text-base font-black text-amber-300 font-mono">
            Rp {user.balance.toLocaleString('id-ID')}
          </span>
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

        <form onSubmit={handleWithdrawSubmit} className="space-y-3">
          {/* Target Bank Information Card */}
          <div className="bg-[#24170d] p-3 rounded-xl border border-amber-900/40 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Rekening Tujuan Penarikan:
            </span>
            <div className="text-xs font-bold text-amber-100">
              {user.bankName} - {user.accountNumber}
            </div>
            <div className="text-[11px] text-amber-300/80 font-medium">
              a/n {user.accountHolder || user.fullName}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-amber-200 block">
                Jumlah Penarikan (Rp)
              </label>
              <button
                type="button"
                onClick={() => setAmount(user.balance.toString())}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
              >
                Tarik Semua
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-black text-amber-400">Rp</span>
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Minimal 25.000"
                className="w-full bg-[#1b1008] border border-amber-900/60 rounded-xl pl-10 pr-3 py-2 text-sm font-mono text-amber-100 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <span className="text-[10px] text-amber-400/60 block mt-1">
              Minimal penarikan Rp 25.000
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-amber-200 block mb-1">
              Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan transfer"
              className="w-full bg-[#1b1008] border border-amber-900/60 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || numAmount < 25000 || numAmount > user.balance}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm tracking-wider uppercase shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'MEMPROSES...' : `TARIK DANA RP ${numAmount.toLocaleString('id-ID')}`}
          </button>
        </form>
      </div>
    </div>
  );
};
