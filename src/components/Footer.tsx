import React from 'react';
import { MessageSquare, Instagram, Facebook, Send, Shield, Hexagon } from 'lucide-react';

interface FooterProps {
  onOpenLiveChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLiveChat }) => {
  return (
    <footer className="w-full max-w-4xl mx-auto px-3 pt-6 pb-10 mt-6 border-t border-amber-950/80 select-none">
      {/* Upper Footer: Powered By Engine & Certifications & Socials */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Powered By Engine Hexagon */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-[10px] font-bold text-amber-400/80 tracking-widest uppercase">
            Powered By
          </span>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Hexagon className="w-8 h-8 text-white fill-white/90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-xs rotate-45" />
              </div>
            </div>
            <span className="text-xl font-black tracking-widest text-white uppercase font-['Chakra_Petch']">
              ENGINE
            </span>
          </div>
        </div>

        {/* Center: Certification & Gaming License Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* BMM Testlabs */}
          <div className="px-2.5 py-1 rounded bg-[#21160d] border border-amber-900/40 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex flex-col text-[9px] font-black leading-tight text-amber-200">
              <span>bmm</span>
              <span className="text-amber-400/70 text-[7px]">testlabs</span>
            </div>
          </div>

          {/* Curacao eGaming */}
          <div className="px-2.5 py-1 rounded bg-[#21160d] border border-amber-900/40 flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-600/60 border border-cyan-400 flex items-center justify-center text-[7px] font-bold">
              ✓
            </div>
            <span className="text-[9px] font-black text-amber-200 uppercase tracking-tight">
              Curaçao eGaming
            </span>
          </div>

          {/* Responsible Gambling */}
          <div className="px-2.5 py-1 rounded bg-[#21160d] border border-amber-900/40 flex items-center gap-1">
            <span className="text-[9px] font-bold text-amber-300">
              Responsible Gambling 18+
            </span>
          </div>

          {/* Gambleaware */}
          <div className="px-2.5 py-1 rounded bg-[#21160d] border border-amber-900/40 flex items-center gap-1">
            <span className="text-[9px] font-bold text-amber-200/90">
              begambleaware.org
            </span>
          </div>
        </div>

        {/* Right: Social Quick Links */}
        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/?text=Halo%20KARA111"
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp Resmi KARA111"
            className="w-8 h-8 rounded-full bg-green-950/80 hover:bg-green-800 text-green-400 border border-green-700/50 flex items-center justify-center transition-colors shadow"
          >
            <span className="text-xs font-bold">WA</span>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Resmi KARA111"
            className="w-8 h-8 rounded-full bg-pink-950/80 hover:bg-pink-800 text-pink-400 border border-pink-700/50 flex items-center justify-center transition-colors shadow"
          >
            <Instagram className="w-4 h-4" />
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook Resmi KARA111"
            className="w-8 h-8 rounded-full bg-blue-950/80 hover:bg-blue-800 text-blue-400 border border-blue-700/50 flex items-center justify-center transition-colors shadow"
          >
            <Facebook className="w-4 h-4" />
          </a>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            title="Telegram Resmi KARA111"
            className="w-8 h-8 rounded-full bg-sky-950/80 hover:bg-sky-800 text-sky-400 border border-sky-700/50 flex items-center justify-center transition-colors shadow"
          >
            <Send className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="mt-6 pt-4 border-t border-amber-950/50 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-400/80">
        <p className="font-extrabold tracking-wide text-amber-300">
          Copyright @ Kara111 All Rights Reserved
        </p>
        <p className="text-[11px] text-amber-500/60 font-medium">
          Keamanan & Kerahasiaan Data Member Terjamin 100%
        </p>
      </div>
    </footer>
  );
};
