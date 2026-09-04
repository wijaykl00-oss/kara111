import React from 'react';
import { PARTNERS_LIST } from '../data/games.ts';
import { ShieldCheck } from 'lucide-react';

export const ExclusivePartners: React.FC = () => {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 my-4 select-none">
      <div className="bg-[#170f09] rounded-2xl border border-amber-950/70 p-4 shadow-lg">
        {/* Header */}
        <div className="flex flex-col mb-3">
          <div className="flex items-center gap-1.5 text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-base font-black tracking-wide text-amber-400">
              Mitra Eksklusif
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-amber-200/70 mt-0.5">
            Kami Hanya Menyediakan Game Yang Sudah Terbukti dan Berlisensi!
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-1.5 sm:gap-2">
          {PARTNERS_LIST.map((name, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center p-2 rounded-lg bg-[#24170d] hover:bg-[#332113] border border-amber-900/30 hover:border-amber-500/40 text-center transition-all duration-150 cursor-pointer group shadow-xs"
            >
              <span className="text-[9px] sm:text-[10px] font-black text-amber-200/80 group-hover:text-amber-300 tracking-tight leading-tight line-clamp-1">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
