import React from 'react';
import { X, Gift, Sparkles, Trophy, Rocket, Percent } from 'lucide-react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
}

const PROMOS = [
  {
    id: 'p1',
    title: 'TURNAMEN PERKALIAN SPACEMAN 5000x',
    category: 'TOURNAMENT',
    icon: Rocket,
    tag: 'SEDANG BERLANGSUNG',
    desc: 'Capai perkalian tertinggi di permainan Spaceman Pragmatic Play dan raih total hadiah pool ratusan juta rupiah!',
    color: 'from-purple-600 to-indigo-700'
  },
  {
    id: 'p2',
    title: 'WELCOME BONUS NEW MEMBER 100%',
    category: 'SLOT BONUS',
    icon: Gift,
    tag: 'MEMBER BARU',
    desc: 'Klaim tambahan saldo 100% pada deposit pertama Anda dengan Turn Over terendah di seluruh platform online.',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'p3',
    title: 'CASHBACK SLOT & ARCADE 5%',
    category: 'CASHBACK',
    icon: Percent,
    tag: 'SETIAP SENIN',
    desc: 'Nikmati jaminan pengembalian dana hingga 5% dibagikan otomatis setiap hari Senin tanpa syarat rumit.',
    color: 'from-rose-600 to-pink-700'
  },
  {
    id: 'p4',
    title: 'KOMISI ROLLINGAN LIVE CASINO 0.8%',
    category: 'CASINO',
    icon: Trophy,
    tag: 'TANPA BATAS',
    desc: 'Semakin sering bermain baccarat, roulette, dan blackjack live dealer, semakin melimpah bonus rollingan Anda!',
    color: 'from-emerald-600 to-teal-700'
  }
];

export const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  onClose,
  onClaim
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-[#1a120b] border border-amber-500/50 rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1e14] text-amber-400 hover:text-white border border-amber-900/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-900/40">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-amber-300 font-['Chakra_Petch']">
              PROMOSI EKSKLUSIF KARA111
            </h2>
            <p className="text-[11px] text-amber-200/70">
              Bonus terbesar dan turnamen resmi berhadiah fantastis
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {PROMOS.map((promo) => {
            const Icon = promo.icon;
            return (
              <div
                key={promo.id}
                className="p-3 sm:p-4 rounded-xl bg-[#24170d] border border-amber-900/40 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${promo.color} flex items-center justify-center text-white shrink-0 shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {promo.tag}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400/60 uppercase">
                        {promo.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-amber-100 uppercase mt-0.5">
                      {promo.title}
                    </h3>
                    <p className="text-xs text-amber-200/70 mt-1 line-clamp-2">
                      {promo.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClaim();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow active:scale-95 shrink-0 transition-colors"
                >
                  Klaim Promo
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
