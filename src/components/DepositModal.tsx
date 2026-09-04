import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface DepositModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onDepositSuccess: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];

const PAYMENT_METHODS = [
  {
    id: 'QRIS',
    label: 'QRIS',
    type: 'qris',
    acc: 'KARA111 OFFICIAL',
    num: 'NMID: ID102003889111',
  },
  {
    id: 'BCA',
    label: 'BCA',
    type: 'bank',
    acc: 'PT KARA MAKMUR SEJAHTERA',
    num: '8271009988',
  },
  {
    id: 'DANA',
    label: 'DANA',
    type: 'ewallet',
    acc: 'KARA111 OFFICIAL',
    num: '08128899111',
  },
  {
    id: 'BRI',
    label: 'BRI',
    type: 'bank',
    acc: 'KARA111 INDO',
    num: '034101009988501',
  },
  {
    id: 'MANDIRI',
    label: 'MANDIRI',
    type: 'bank',
    acc: 'KARA111 INDONESIA',
    num: '1370098877661',
  },
];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  user,
  onClose,
  onDepositSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [amount, setAmount] = useState<number>(20000);
  const [customAmount, setCustomAmount] = useState<string>('20000');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrZoom, setShowQrZoom] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    newBalance?: number;
  } | null>(null);

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
          bankName: selectedMethod.id === 'QRIS' ? 'QRIS INSTAN' : selectedMethod.id,
          notes: notes || `Deposit via ${selectedMethod.id}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memproses deposit');
      setMessage({
        type: 'success',
        text: `Deposit Rp ${amount.toLocaleString('id-ID')} berhasil!`,
        newBalance: data.newBalance,
      });
      onDepositSuccess(data.newBalance);
      setTimeout(() => { onClose(); }, 2500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  const formattedAmount = amount > 0 ? amount.toLocaleString('id-ID') : '0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#1a1100] rounded-2xl shadow-2xl border border-amber-800/40 overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-amber-900/40 bg-[#120c00] shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-amber-400 hover:bg-amber-900/30 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="flex-1 text-center text-lg font-black text-amber-400 tracking-widest uppercase font-['Chakra_Petch']">
            Deposit
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-amber-400 hover:bg-amber-900/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <form onSubmit={handleDepositSubmit}>

            {message && (
              <div
                className={`mx-4 mt-4 p-3 rounded-xl border flex items-start gap-2 text-xs font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                    : 'bg-red-950/80 border-red-700 text-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span>{message.text}</span>
                  {message.type === 'success' && message.newBalance !== undefined && (
                    <div className="text-emerald-400 font-mono mt-0.5">
                      Saldo: <strong className="text-yellow-300">Rp {message.newBalance.toLocaleString('id-ID')}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="px-4 pt-4 pb-2">
              <p className="text-amber-300 text-sm font-bold leading-snug">
                Transfer ke akun bank di bawah ini menggunakan bank dan nominal yang sudah tertera:
              </p>
            </div>

            {/* Info Table */}
            <div className="mx-4 rounded-xl border border-amber-800/40 overflow-hidden text-sm divide-y divide-amber-900/40">
              {/* Bank row */}
              <div className="flex items-center">
                <span className="w-44 shrink-0 px-4 py-3 text-amber-200/70 font-medium">Bank</span>
                <div className="flex-1 px-4 py-3 relative">
                  <button
                    type="button"
                    onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                    className="flex items-center gap-2 text-amber-300 font-black hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    {selectedMethod.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMethodDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showMethodDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-[#1a1100] border border-amber-700/50 rounded-xl shadow-xl z-20 overflow-hidden">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMethod(m);
                            setShowMethodDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                            selectedMethod.id === m.id
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'text-amber-200/80 hover:bg-amber-900/30'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Nominal row */}
              <div className="flex items-start">
                <span className="w-44 shrink-0 px-4 py-3 text-amber-200/70 font-medium leading-tight">
                  Jumlah Pembayaran<br />
                  <span className="text-amber-500 text-[11px]">(Nominal harus sama)</span>
                </span>
                <div className="flex-1 px-4 py-3">
                  <span className="text-amber-300 font-black text-base tracking-wider">
                    {formattedAmount}
                  </span>
                </div>
              </div>

              {/* Keterangan row */}
              <div className="flex items-center">
                <span className="w-44 shrink-0 px-4 py-3 text-amber-200/70 font-medium">Keterangan</span>
                <div className="flex-1 px-4 py-3">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="–"
                    className="bg-transparent text-amber-300 font-medium text-sm placeholder-amber-800 focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mx-4 mt-3 text-center">
              <p className="text-red-400 text-xs font-bold">
                ⚠ PENTING! Transaksi anda tidak dapat diproses jika nominal berbeda
              </p>
              <p className="text-amber-200/70 text-xs mt-1">
                Pastikan Anda menyimpan bukti transfer Deposit yang akan anda lakukan.
              </p>
            </div>

            {/* Nominal Quick Select */}
            <div className="px-4 mt-4">
              <p className="text-xs font-extrabold text-amber-200/80 uppercase tracking-wider mb-2">
                Pilih Nominal:
              </p>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountSelect(amt)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      amount === amt
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'bg-[#2a1a00] text-amber-300 border border-amber-800/40 hover:bg-amber-900/30'
                    }`}
                  >
                    {amt >= 1000000 ? `${amt / 1000000}Jt` : `${amt / 1000}rb`}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-black text-amber-500">Rp</span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="Nominal lainnya"
                  className="w-full bg-[#120c00] border border-amber-800/50 rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono text-amber-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* QR Code (QRIS only) */}
            {selectedMethod.type === 'qris' && (
              <div className="mx-4 mt-4 bg-[#120c00] border border-amber-800/40 rounded-2xl overflow-hidden">
                <div className="bg-white p-4 flex flex-col items-center">
                  <p className="text-stone-900 font-black text-sm tracking-widest uppercase mb-0.5">
                    KARA111 OFFICIAL
                  </p>
                  <p className="text-stone-500 font-mono text-[11px] mb-3">
                    NMID : ID102003889111
                  </p>
                  <div
                    className="relative border-4 border-amber-500 rounded-xl p-1 bg-white group cursor-pointer"
                    onClick={() => setShowQrZoom(true)}
                  >
                    <img
                      src="/qris.png"
                      alt="QRIS Kara111"
                      className="w-52 h-52 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 p-1.5 rounded bg-stone-900/80 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-stone-600 text-xs font-bold block">Nominal Transfer:</span>
                    <span className="text-amber-900 font-black font-mono text-lg bg-amber-100 px-4 py-0.5 rounded-full border border-amber-300 inline-block mt-0.5">
                      Rp {formattedAmount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-amber-900/40">
                  <div className="text-xs text-amber-300/80">
                    <span className="font-bold text-amber-400 block">NMID:</span>
                    ID102003889111
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('ID102003889111')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Tersalin!' : 'Salin NMID'}
                  </button>
                </div>
              </div>
            )}

            {/* Bank / E-Wallet Account */}
            {selectedMethod.type !== 'qris' && (
              <div className="mx-4 mt-4 bg-[#1e1200] border border-amber-800/40 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                    Nomor {selectedMethod.type === 'ewallet' ? 'E-Wallet' : 'Rekening'}
                  </p>
                  <p className="text-amber-300 font-black font-mono text-lg mt-0.5">
                    {selectedMethod.num}
                  </p>
                  <p className="text-amber-200/70 text-xs mt-0.5">a/n {selectedMethod.acc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedMethod.num)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="px-4 py-4 space-y-2">
              {selectedMethod.type === 'qris' && (
                <a
                  href="/qris.png"
                  download="QRIS-KARA111.png"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-sm border border-amber-600/40 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QRIS
                </a>
              )}
              <button
                type="submit"
                disabled={loading || amount < 10000}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                    MEMPROSES...
                  </>
                ) : (
                  `KONFIRMASI DEPOSIT Rp ${formattedAmount}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* QR Zoom Modal */}
      {showQrZoom && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setShowQrZoom(false)}
        >
          <div
            className="relative max-w-xs w-full bg-white p-5 rounded-2xl border-4 border-amber-500 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrZoom(false)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900 text-white hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-stone-900 font-black tracking-widest uppercase text-sm mb-0.5">
              KARA111 QRIS RESMI
            </p>
            <p className="text-stone-500 font-mono text-xs mb-3">NMID: ID102003889111</p>
            <img
              src="/qris.png"
              alt="QRIS Kara111 Full"
              className="w-64 h-64 object-contain rounded-lg border border-stone-200"
            />
            <a
              href="/qris.png"
              download="QRIS-KARA111.png"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm"
            >
              <Download className="w-4 h-4" />
              Unduh Gambar QRIS
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
