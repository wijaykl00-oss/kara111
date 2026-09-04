import React, { useState, useEffect } from 'react';
import { X, History, ArrowDownLeft, ArrowUpRight, Trophy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { TransactionItem, UserProfile } from '../types.ts';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  user,
  onClose
}) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'SPIN_WIN'>('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?userId=${user.id}`);
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, user.id]);

  if (!isOpen) return null;

  const filtered = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#1a120b] border border-amber-500/50 rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1e14] text-amber-400 hover:text-white border border-amber-900/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-300 font-['Chakra_Petch']">
                RIWAYAT TRANSAKSI
              </h2>
              <span className="text-xs text-amber-200/70">
                Akun: {user.username} ({user.bankName})
              </span>
            </div>
          </div>

          <button
            onClick={fetchHistory}
            className="p-1.5 rounded-lg bg-[#2a1e14] text-amber-400 hover:text-amber-200 transition-colors mr-8"
            title="Refresh Riwayat"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 my-3 overflow-x-auto pb-1">
          {(['ALL', 'DEPOSIT', 'WITHDRAW', 'SPIN_WIN'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-amber-400 text-stone-950 font-black shadow-sm'
                  : 'bg-[#24170d] text-amber-200 border border-amber-900/40 hover:bg-[#311f12]'
              }`}
            >
              {f === 'ALL'
                ? 'Semua Transaksi'
                : f === 'DEPOSIT'
                ? 'Deposit'
                : f === 'WITHDRAW'
                ? 'Withdraw'
                : 'Hadiah Spin'}
            </button>
          ))}
        </div>

        {/* List of Transactions */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading && transactions.length === 0 ? (
            <div className="py-12 text-center text-amber-400 text-xs">
              Memuat data transaksi...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-amber-400/60 text-xs">
              Belum ada data transaksi yang sesuai
            </div>
          ) : (
            filtered.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-[#24170d] border border-amber-900/40 flex items-center justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'DEPOSIT' || tx.type === 'SPIN_WIN' || tx.type === 'GAME_WIN'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'WITHDRAW' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Trophy className="w-4 h-4" />
                    )}
                  </div>

                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-100 uppercase">
                        {tx.type === 'DEPOSIT'
                          ? 'Deposit Saldo'
                          : tx.type === 'WITHDRAW'
                          ? 'Penarikan Dana'
                          : tx.type === 'SPIN_WIN'
                          ? 'Hadiah Lucky Spin'
                          : 'Taruhan Game'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300/80 block mt-0.5">
                      {tx.notes || tx.bankName}
                    </span>
                    <span className="text-[10px] text-amber-400/50 block font-mono">
                      {new Date(tx.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-black font-mono block ${
                      tx.type === 'DEPOSIT' || tx.type === 'SPIN_WIN' || tx.type === 'GAME_WIN'
                        ? 'text-emerald-400'
                        : 'text-amber-200'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' || tx.type === 'SPIN_WIN' || tx.type === 'GAME_WIN' ? '+' : '-'}
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-amber-400/60 font-mono">
                    {tx.id}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
