import React, { useState } from 'react';
import {
  X,
  ArrowDownLeft,
  QrCode,
  Building,
  Wallet,
  CheckCircle2,
  Copy,
  AlertCircle,
  Download,
  Sparkles,
  Zap,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface DepositModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onDepositSuccess: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];

const PAYMENT_METHODS = [
  {
    id: 'QRIS',
    label: 'QRIS All Payment (BCA, Mandiri, BRI, DANA, GoPay, OVO, ShopeePay)',
    type: 'qris',
    acc: 'KARA111 OFFICIAL',
    num: 'NMID: ID102003889111',
    image: '/qris.png',
    badge: 'Proses Otomatis Instan 1 Detik'
  },
  {
    id: 'BCA',
    label: 'Bank Central Asia (BCA Transfer)',
    type: 'bank',
    acc: 'PT KARA MAKMUR SEJAHTERA',
    num: '8271009988',
    badge: 'Online 24 Jam'
  },
  {
    id: 'DANA',
    label: 'DANA E-Wallet',
    type: 'ewallet',
    acc: 'KARA111 OFFICIAL',
    num: '08128899111',
    badge: 'Online 24 Jam'
  },
  {
    id: 'BRI',
    label: 'Bank Rakyat Indonesia (BRI)',
    type: 'bank',
    acc: 'KARA111 INDO',
    num: '034101009988501',
    badge: 'Online 24 Jam'
  },
  {
    id: 'MANDIRI',
    label: 'Bank Mandiri',
    type: 'bank',
    acc: 'KARA111 INDONESIA',
    num: '1370098877661',
    badge: 'Online 24 Jam'
  },
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
  const [showQrZoom, setShowQrZoom] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; newBalance?: number; addedAmount?: number } | null>(null);

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
          notes: notes || `Deposit via ${selectedMethod.id}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses deposit');
      }

      // Instant success feedback
      setMessage({
        type: 'success',
        text: `Deposit Rp ${amount.toLocaleString('id-ID')} Berhasil! Saldo Akun Anda Langsung Bertambah.`,
        newBalance: data.newBalance,
        addedAmount: amount
      });

      // Update parent state balance immediately
      onDepositSuccess(data.newBalance);

      // Auto close after 2.5 seconds or let user close
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat memproses deposit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1e140c] to-[#120b06] border-2 border-amber-500/60 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.25)] p-4 sm:p-6 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-[#2a1d12] hover:bg-red-950/80 text-amber-400 hover:text-red-300 border border-amber-800/60 transition-colors shadow-md cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-900/50">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-500/30">
            <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-['Chakra_Petch'] tracking-wide">
                DEPOSIT SALDO AKUN
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-emerald-400" /> Auto Instant
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Scan QRIS atau transfer bank resmi, saldo langsung otomatis masuk dalam 1 detik!
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {message && (
          <div
            className={`p-3.5 mb-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm font-semibold transition-all ${
              message.type === 'success'
                ? 'bg-gradient-to-r from-emerald-950/90 to-green-900/80 border-emerald-500 text-emerald-100 shadow-lg shadow-emerald-950/50'
                : 'bg-red-950/90 border-red-700 text-red-200 shadow-md'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="block font-bold text-sm">{message.text}</span>
              {message.type === 'success' && message.newBalance !== undefined && (
                <div className="mt-1 text-xs text-emerald-300/90 font-mono">
                  Saldo Akun Sekarang: <strong className="text-yellow-300 font-bold">Rp {message.newBalance.toLocaleString('id-ID')}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Deposit Form */}
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          {/* Method Selection Tabs */}
          <div>
            <label className="text-xs font-extrabold text-amber-200 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[11px] font-black">1</span>
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = selectedMethod.id === m.id;
                const isQRIS = m.id === 'QRIS';
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m)}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-white'
                        : 'bg-[#23170e] border-amber-900/40 text-amber-200/80 hover:bg-[#2d1e13] hover:border-amber-700/50'
                    } ${isQRIS ? 'sm:col-span-2' : ''}`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-[#180f08] text-amber-400'}`}>
                      {m.type === 'qris' ? (
                        <QrCode className="w-5 h-5" />
                      ) : m.type === 'ewallet' ? (
                        <Wallet className="w-5 h-5" />
                      ) : (
                        <Building className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black tracking-wide ${isSelected ? 'text-amber-300' : 'text-amber-100'}`}>
                          {m.id === 'QRIS' ? 'QRIS INSTAN (Semua Bank & E-Wallet)' : m.id}
                        </span>
                        {m.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-300/70 truncate block mt-0.5">
                        {m.acc}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QRIS Display Card (When QRIS is selected) */}
          {selectedMethod.id === 'QRIS' && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#2a1b10] to-[#1d1209] border-2 border-amber-500/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-amber-900/50 pb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-black text-amber-300 block">
                      QRIS PEMBAYARAN RESMI KARA111
                    </span>
                    <span className="text-[10px] text-amber-200/70 block">
                      Support: BCA, Mandiri, BRI, BNI, GoPay, DANA, OVO, ShopeePay, LinkAja, Seabank
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/60 text-emerald-400 text-[10px] font-bold">
                  Proses 1 Detik
                </span>
              </div>

              {/* QR Image Container */}
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-inner relative group">
                <div className="text-center mb-1.5">
                  <span className="text-[11px] font-black text-stone-900 tracking-widest uppercase block">
                    KARA111 OFFICIAL
                  </span>
                  <span className="text-[9px] font-mono text-stone-600 font-bold block">
                    NMID : ID102003889111
                  </span>
                </div>

                <div className="relative border-4 border-amber-500 rounded-lg p-1 bg-white shadow-md">
                  <img
                    src="/qris.png"
                    alt="QRIS Kara111"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded cursor-pointer hover:scale-102 transition-transform duration-200"
                    onClick={() => setShowQrZoom(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowQrZoom(true)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-md bg-stone-900/80 hover:bg-stone-950 text-amber-400 text-xs flex items-center gap-1 shadow cursor-pointer transition-colors"
                    title="Perbesar QR Code"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount To Scan Display */}
                <div className="mt-2.5 text-center">
                  <span className="text-[11px] text-stone-700 font-bold block">
                    Nominal Transfer:
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-900 font-mono tracking-wider bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300 inline-block mt-0.5">
                    Rp {amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* QR Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="/qris.png"
                  download="QRIS-KARA111.png"
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar QRIS</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy('ID102003889111')}
                  className="py-2 px-3 rounded-lg bg-[#1a1109] hover:bg-[#25180e] text-amber-300 font-bold text-xs border border-amber-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'NMID Tersalin' : 'Salin NMID'}</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="p-2.5 rounded-xl bg-[#180f08]/80 border border-amber-900/40 text-[11px] text-amber-200/90 space-y-1">
                <span className="font-black text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cara Deposit QRIS Instan:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-amber-200/80 text-[10.5px]">
                  <li>Buka BCA Mobile, Livin, BRImo, DANA, GoPay, OVO, atau ShopeePay.</li>
                  <li>Scan QRIS di atas lalu masukkan nominal <strong>Rp {amount.toLocaleString('id-ID')}</strong>.</li>
                  <li>Setelah transfer berhasil, klik tombol <strong>"KONFIRMASI DEPOSIT SALDO"</strong> di bawah.</li>
                  <li>Saldo akun Anda langsung bertambah otomatis dalam hitungan detik!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Bank Transfer Details Card (When a Bank is selected) */}
          {selectedMethod.id !== 'QRIS' && (
            <div className="p-3.5 rounded-xl bg-[#24170d] border border-amber-800/40 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Rekening Tujuan Transfer {selectedMethod.id}:
              </span>
              <div className="flex items-center justify-between bg-[#180f08] p-2.5 rounded-lg border border-amber-900/50">
                <div>
                  <span className="text-[11px] text-amber-200/70 block">Nomor Rekening / HP:</span>
                  <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-wider">
                    {selectedMethod.num}
                  </span>
                  <span className="text-xs text-amber-100 block font-semibold mt-0.5">
                    a/n {selectedMethod.acc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedMethod.num)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Tersalin' : 'Salin Nomor'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Nominal Quick Presets */}
          <div>
            <label className="text-xs font-extrabold text-amber-200 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[11px] font-black">2</span>
              Pilih Nominal Deposit:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountSelect(amt)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    amount === amt
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 font-black shadow-md scale-102 border border-yellow-300'
                      : 'bg-[#24170d] text-amber-200 border border-amber-900/40 hover:bg-[#311f12] hover:border-amber-700/50'
                  }`}
                >
                  Rp {(amt / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
            </div>

            <div className="relative flex items-center mt-2">
              <span className="absolute left-3.5 text-xs font-black text-amber-400">Rp</span>
              <input
                type="text"
                required
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Jumlah nominal lainnya"
                className="w-full bg-[#170e07] border border-amber-900/60 rounded-xl pl-11 pr-3 py-2.5 text-sm font-mono text-amber-100 font-bold focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Sender Notes */}
          <div>
            <label className="text-[11px] font-bold text-amber-200 block mb-1">
              Catatan Pengirim (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: QRIS dari BCA / DANA nama akun"
              className="w-full bg-[#170e07] border border-amber-900/60 rounded-lg px-3 py-2 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Guarantee Footer Badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-900/40 text-[11px] text-amber-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Garansi 100% Saldo Otomatis Masuk Tanpa Potongan</span>
            </div>
            <span className="text-amber-400 font-mono font-bold">24 JAM NONSTOP</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || amount < 10000}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                MEMPROSES DEPOSIT...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-stone-950" />
                KONFIRMASI DEPOSIT RP {amount.toLocaleString('id-ID')}
              </span>
            )}
          </button>
        </form>

        {/* QR Zoom Modal Preview */}
        {showQrZoom && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-fadeIn"
            onClick={() => setShowQrZoom(false)}
          >
            <div
              className="relative max-w-sm w-full bg-white p-6 rounded-2xl border-4 border-amber-500 shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQrZoom(false)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900 text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-sm font-black text-stone-900 tracking-wider uppercase mb-1">
                KARA111 QRIS RESMI
              </span>
              <span className="text-xs text-stone-600 font-mono mb-3">NMID: ID102003889111</span>
              <img
                src="/qris.png"
                alt="QRIS Kara111 Full"
                className="w-72 h-72 object-contain rounded-lg border-2 border-stone-200"
              />
              <div className="mt-4 flex items-center gap-2 w-full">
                <a
                  href="/qris.png"
                  download="QRIS-KARA111.png"
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1 shadow text-center"
                >
                  <Download className="w-4 h-4" />
                  Unduh Gambar QRIS
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
