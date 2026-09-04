import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Gift, Sparkles, Trophy, Rocket } from 'lucide-react';

interface HeroBannerProps {
  onJoinGroup: () => void;
  onOpenPromos: () => void;
  onLaunchSpaceman: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onJoinGroup,
  onOpenPromos,
  onLaunchSpaceman
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'spaceman',
      title: 'TURNAMEN PERKALIAN',
      subtitle: '26.00x • 100.99x • 5000x',
      badge: 'SPACEMAN',
      desc: 'Raih Perkalian Tertinggi & Menangkan Total Hadiah Ratusan Juta Rupiah!',
      buttonText: 'MAIN SEKARANG',
      bgGradient: 'from-purple-950 via-[#1b0933] to-[#2b1055]',
      action: onLaunchSpaceman
    },
    {
      id: 'bonus',
      title: 'BONUS NEW MEMBER 100%',
      subtitle: 'DEPO CEPAT • TO RENDAH',
      badge: 'KARA111 PROMO',
      desc: 'Daftar sekarang & klaim bonus sambutan langsung masuk ke saldo akun!',
      buttonText: 'KLAIM PROMO',
      bgGradient: 'from-amber-950 via-[#2d1b06] to-[#452809]',
      action: onOpenPromos
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 my-2 select-none">
      {/* Banner Carousel Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] bg-stone-900 group">
        <div
          onClick={slide.action}
          className={`relative min-h-[170px] sm:min-h-[190px] p-4 sm:p-6 flex flex-col justify-between cursor-pointer bg-gradient-to-r ${slide.bgGradient} transition-all duration-500`}
        >
          {/* Decorative Stars / Cosmic Particles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none opacity-60" />
          
          {/* Decorative Planet & Neon Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 right-24 w-36 h-36 rounded-full bg-amber-500/20 blur-xl pointer-events-none" />

          {/* Top Row: Spaceman Badge & 5000x */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/80 border border-purple-400/50 text-purple-200 text-xs font-black tracking-wider uppercase backdrop-blur-sm shadow">
              <Rocket className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              {slide.badge}
            </span>

            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>MAXWIN 5000x</span>
            </div>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white uppercase font-['Chakra_Petch'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                {slide.title}
              </span>
            </h1>
            <div className="text-sm sm:text-base font-extrabold text-cyan-300 tracking-wider mt-0.5 drop-shadow">
              {slide.subtitle}
            </div>
            <p className="text-[11px] sm:text-xs text-amber-100/80 mt-1 max-w-md line-clamp-2">
              {slide.desc}
            </p>
          </div>

          {/* Bottom Action Area */}
          <div className="relative z-10 flex items-center justify-between">
            <button className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-black text-xs tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-transform flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {slide.buttonText}
            </button>

            {/* Astronaut / Visual Illustration Mock */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white/80 shadow flex items-center justify-center text-sm font-bold">
                  🚀
                </span>
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 border-2 border-white/80 shadow flex items-center justify-center text-sm font-bold">
                  🏆
                </span>
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-pink-600 border-2 border-white/80 shadow flex items-center justify-center text-sm font-bold">
                  💎
                </span>
              </div>
            </div>
          </div>

          {/* Arrows for Carousel */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
            }}
            aria-label="Slide Sebelumnya"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="w-4 h-4 font-bold" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide((prev) => (prev + 1) % slides.length);
            }}
            aria-label="Slide Selanjutnya"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="w-4 h-4 font-bold" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Two Big Action Buttons: Join Grup & Promosi */}
      <div className="grid grid-cols-2 gap-2.5 mt-2.5">
        {/* Join Grup (WhatsApp green gradient) */}
        <button
          onClick={onJoinGroup}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-green-900/30 border border-green-400/40 active:scale-[0.98] transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Join Grup</span>
        </button>

        {/* Promosi (Magenta/Pink gradient) */}
        <button
          onClick={onOpenPromos}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-pink-900/30 border border-pink-400/40 active:scale-[0.98] transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Gift className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Promosi</span>
        </button>
      </div>
    </div>
  );
};
