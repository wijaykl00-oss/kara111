import React from 'react';
import { PARTNERS_LIST } from '../data/games.ts';

export const ExclusivePartners: React.FC = () => {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 my-4 select-none">
      <div className="bg-[#170f09] rounded-2xl border border-amber-950/70 p-4 shadow-lg">
        {/* Header */}
        <div className="flex flex-col mb-3">
          <h3 className="text-base font-black tracking-wide text-amber-400 font-['Chakra_Petch']">
            Mitra Eksklusif
          </h3>
          <p className="text-[11px] text-amber-200/80 mt-0.5">
            Kami Hanya Menyediakan Game Yang Sudah Terbukti dan Berlisensi!
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-1.5 sm:gap-2">
          {PARTNERS_LIST.map((name, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center p-2 rounded-lg bg-[#24170d] hover:bg-[#332113] border border-amber-900/30 hover:border-amber-500/40 text-center transition-all duration-150 cursor-pointer group shadow-xs min-h-[42px]"
            >
              <span className="text-[9px] sm:text-[10px] font-black text-amber-200/90 group-hover:text-amber-300 tracking-tight leading-tight line-clamp-1">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
