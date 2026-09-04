import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface BankBadge {
  name: string;
  isOnline: boolean;
  color?: string;
}

const ROW_1: BankBadge[] = [
  { name: 'BCA', isOnline: true, color: 'text-blue-700' },
  { name: 'DANA', isOnline: true, color: 'text-sky-500' },
  { name: 'BNI', isOnline: false, color: 'text-teal-700' },
  { name: 'mandiri', isOnline: false, color: 'text-blue-900' },
];

const ROW_2: BankBadge[] = [
  { name: 'BANK', isOnline: false, color: 'text-stone-900' },
  { name: 'BCA', isOnline: false, color: 'text-blue-700' },
  { name: 'BANK BRI', isOnline: false, color: 'text-blue-800' },
];

export const BankInfo: React.FC = () => {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 my-4 select-none">
      <div className="bg-[#170f09] rounded-2xl border border-amber-950/70 p-4 shadow-lg space-y-3">
        {/* Header */}
        <h3 className="text-base font-black tracking-wide text-amber-400 font-['Chakra_Petch']">
          Bank Info
        </h3>

        {/* Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROW_1.map((b, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {b.isOnline ? (
                <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs">
                  ✓
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs">
                  ✕
                </div>
              )}
              <div className="flex-1 bg-white py-1.5 px-3 rounded-md shadow-sm flex items-center justify-center">
                <span className={`text-xs font-black tracking-wide ${b.color || 'text-stone-900'} uppercase font-sans`}>
                  {b.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto">
          {ROW_2.map((b, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {b.isOnline ? (
                <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs">
                  ✓
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs">
                  ✕
                </div>
              )}
              <div className="flex-1 bg-white py-1.5 px-3 rounded-md shadow-sm flex items-center justify-center">
                <span className={`text-xs font-black tracking-wide ${b.color || 'text-stone-900'} uppercase font-sans`}>
                  {b.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Status Notice Box */}
        <div className="mt-2 p-2.5 rounded-xl bg-[#2a1b10] border border-amber-900/40 text-center text-amber-200/90 text-xs font-medium">
          BNI, MANDIRI, DBS, BCA, BRI, Sedang Dalam Gangguan, Mohon Hubungi Customer Service
        </div>
      </div>
    </section>
  );
};
