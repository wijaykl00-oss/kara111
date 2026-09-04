import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Building } from 'lucide-react';

interface BankItem {
  name: string;
  isOnline: boolean;
  type: 'bank' | 'ewallet';
}

const BANKS: BankItem[] = [
  { name: 'BCA', isOnline: true, type: 'bank' },
  { name: 'DANA', isOnline: true, type: 'ewallet' },
  { name: 'BNI', isOnline: false, type: 'bank' },
  { name: 'MANDIRI', isOnline: false, type: 'bank' },
  { name: 'CIMB', isOnline: false, type: 'bank' },
  { name: 'PERMATA', isOnline: false, type: 'bank' },
  { name: 'BANK BRI', isOnline: false, type: 'bank' },
];

export const BankInfo: React.FC = () => {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 my-4 select-none">
      <div className="bg-[#170f09] rounded-2xl border border-amber-950/70 p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Building className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-black tracking-wide text-amber-400">
            Bank Info
          </h3>
        </div>

        {/* Bank List Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {BANKS.map((b, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#26190e] border border-amber-900/40 shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                {b.isOnline ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span className="text-xs font-black text-amber-100 tracking-wider">
                  {b.name}
                </span>
              </div>
              <span
                className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded ${
                  b.isOnline
                    ? 'text-emerald-400 bg-emerald-950/60'
                    : 'text-rose-400 bg-rose-950/60'
                }`}
              >
                {b.isOnline ? 'Online' : 'Gangguan'}
              </span>
            </div>
          ))}
        </div>

        {/* Status Notice Box */}
        <div className="mt-3 p-2.5 rounded-xl bg-[#2e1d0f]/80 border border-amber-800/40 flex items-center gap-2 text-amber-200/90 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-[11px] sm:text-xs">
            BNI, MANDIRI, DBS, BCA, BRI, Sedang Dalam Gangguan, Mohon Hubungi Customer Service via Live Chat
          </span>
        </div>
      </div>
    </section>
  );
};
