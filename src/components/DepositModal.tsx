import React, { useState } from 'react';
import { X, ArrowDownLeft, QrCode, Building, Wallet, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface DepositModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onDepositSuccess: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000, 500000, 1000000];

const PAYMENT_METHODS = [
  { id: 'QRIS', label: 'QRIS Instan (Semua Bank/E-Wallet)', type: 'qris', acc: 'KARA111 RESMI', num: '00020101021126600016ID...' },
  { id: 'BCA', label: 'Bank Central Asia (BCA)', type: 'bank', acc: 'PT KARA MAKMUR SEJAHTERA', num: '8271009988' },
  { id: 'DANA', label: 'DANA E-Wallet', type: 'ewallet', acc: 'KARA111 OFFICIAL', num: '08128899111' },
  { id: 'BRI', label: 'Bank Rakyat Indonesia (BRI)', type: 'bank', acc: 'KARA111 INDO', num: '034101009988501' },
  { id: 'MANDIRI', label: 'Bank Mandiri', type: 'bank', acc: 'KARA111 INDONESIA', num: '1370098877661' },
];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  user,
  onClose,
  onDepositSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmount(raw);
    setAmount(Number(raw) || 0);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10000) {
      setMessage({ type: 'error', text: 'Minimal deposit adalah Rp 10.000' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          bankName: selectedMethod.id,
          notes: notes || `Deposit via ${selectedMethod.id}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses deposit');
      }

      setMessage({
        type: 'success',
        text: `Deposit Rp ${amount.toLocaleString('id-ID')} berhasil diproses! Saldo akun otomatis bertambah.`
      });

      setTimeout(() => {
        onDepositSuccess(data.newBalance);
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
      <div className="relative w-full max-w-lg bg-[#1a120b] border border-amber-500/50 rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1e14] text-amber-400 hover:text-white border border-amber-900/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-900/40">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 font-black shadow">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-amber-300 font-['Chakra_Petch']">
              FORM DEPOSIT SALDO
            </h2>
            <p className="text-[11px] text-amber-200/70">
              Proses instan 24 jam tanpa potongan admin
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

        <form onSubmit={handleDepositSubmit} className="space-y-4">
          {/* Method Selection */}
          <div>
            <label className="text-xs font-bold text-amber-200 block mb-1.5">
              1. Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    selectedMethod.id === m.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-[#24170d] border-amber-900/40 text-amber-100/80 hover:bg-[#2d1d11]'
                  }`}
                >
                  {m.type === 'qris' ? (
                    <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : m.type === 'ewallet' ? (
                    <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Building className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">{m.id}</span>
                    <span className="text-[10px] text-amber-300/70 truncate block">{m.acc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Destination Details Card */}
          <div className="p-3 rounded-xl bg-[#24170d] border border-amber-800/40 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Rekening Tujuan Transfer:
            </span>
            <div className="flex items-center justify-between bg-[#180f08] p-2 rounded-lg border border-amber-900/50">
              <div>
                <span className="text-xs text-amber-200/70 block">Nomor Rekening / E-Wallet:</span>
                <span className="text-sm font-black text-amber-300 font-mono tracking-wider">
                  {selectedMethod.num}
                </span>
                <span className="text-[10px] text-amber-100 block font-semibold mt-0.5">
                  a/n {selectedMethod.acc}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedMethod.num)}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 shadow transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Nominal Quick Presets */}
          <div>
            <label className="text-xs font-bold text-amber-200 block mb-1.5">
              2. Pilih Nominal Deposit
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountSelect(amt)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    amount === amt
                      ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                      : 'bg-[#24170d] text-amber-200 border border-amber-900/40 hover:bg-[#311f12]'
                  }`}
                >
                  Rp {(amt / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-black text-amber-400">Rp</span>
              <input
                type="text"
                required
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Jumlah nominal lainnya"
                className="w-full bg-[#1b1008] border border-amber-900/60 rounded-xl pl-10 pr-3 py-2 text-sm font-mono text-amber-100 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Catatan / Pengirim */}
          <div>
            <label className="text-[11px] font-bold text-amber-200 block mb-1">
              Catatan Pengirim (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Transfer dari BCA Hendra"
              className="w-full bg-[#1b1008] border border-amber-900/60 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || amount < 10000}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'MEMPROSES DEPOSIT...' : `KONFIRMASI DEPOSIT RP ${amount.toLocaleString('id-ID')}`}
          </button>
        </form>
      </div>
    </div>
  );
};
