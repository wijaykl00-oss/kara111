import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RefreshCw, Trophy, Sparkles, Volume2, VolumeX, MessageSquare, Send, Zap, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types.ts';

interface SpacemanGameModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenDeposit: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

interface ChatMessage {
  user: string;
  text: string;
  color?: string;
}

const INITIAL_HISTORY = [
  { mult: 1.90, color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50' },
  { mult: 8.00, color: 'text-purple-400 bg-purple-950/80 border-purple-500/50' },
  { mult: 1.31, color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50' },
  { mult: 1.05, color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50' },
  { mult: 1.06, color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50' },
  { mult: 30.41, color: 'text-pink-400 bg-pink-950/80 border-pink-500/50' },
  { mult: 2.26, color: 'text-purple-400 bg-purple-950/80 border-purple-500/50' },
  { mult: 1.00, color: 'text-rose-400 bg-rose-950/80 border-rose-500/50' },
  { mult: 1.12, color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50' },
  { mult: 2.44, color: 'text-purple-400 bg-purple-950/80 border-purple-500/50' },
  { mult: 5.49, color: 'text-purple-400 bg-purple-950/80 border-purple-500/50' }
];

const INITIAL_CHATS: ChatMessage[] = [
  { user: 'pxell', text: 'enakkk mami' },
  { user: 'adit330', text: 'giliran masang nabrak', color: 'text-yellow-400' },
  { user: 'MusicalClover', text: 'GASSSS', color: 'text-emerald-400' },
  { user: 'xixi', text: 'kapan kali unggu' },
  { user: 'Apipipi', text: 'Sedott trusss' }
];

export const SpacemanGameModal: React.FC<SpacemanGameModalProps> = ({
  isOpen,
  user,
  onClose,
  onOpenLogin,
  onOpenDeposit,
  onBalanceUpdate
}) => {
  const [betAmount, setBetAmount] = useState<number>(2000);
  const [phase, setPhase] = useState<'WAITING' | 'FLYING' | 'CRASHED'>('WAITING');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(2.45);
  const [statusText, setStatusText] = useState<string>('TARUHAN DITUTUP');

  // Cashout Management
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut50, setCashedOut50] = useState(false);
  const [cashedOut100, setCashedOut100] = useState(false);
  const [roundWin, setRoundWin] = useState<number>(0);

  // Auto Cashout Settings
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState(2.0);
  const [autoCashout50Enabled, setAutoCashout50Enabled] = useState(false);
  const [autoCashout50Value, setAutoCashout50Value] = useState(1.5);

  // Multiplier History & Chat
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHATS);
  const [chatInput, setChatInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setPhase('WAITING');
      setStatusText('TARUHAN DITUTUP');
      setMultiplier(1.0);
      setHasBet(false);
      setCashedOut50(false);
      setCashedOut100(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlaceBetAndStart = () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    if (user.balance < betAmount) {
      onOpenDeposit();
      return;
    }

    // Deduct bet from balance
    const newBal = user.balance - betAmount;
    onBalanceUpdate(newBal);

    setHasBet(true);
    setCashedOut50(false);
    setCashedOut100(false);
    setRoundWin(0);

    // Randomize crash point (1.10x - 20.00x)
    const randomCrash = Number((Math.random() < 0.15 ? 1.0 : 1.1 + Math.random() * 4.5 + (Math.random() < 0.2 ? 10 : 0)).toFixed(2));
    setCrashPoint(randomCrash);

    setPhase('FLYING');
    setStatusText('');
    setMultiplier(1.0);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const currentMult = Number((1.0 + Math.pow(elapsed * 0.7, 1.6)).toFixed(2));

      // Auto Cashout 50% Check
      if (autoCashout50Enabled && !cashedOut50 && currentMult >= autoCashout50Value) {
        handleCashout50(currentMult);
      }

      // Auto Cashout 100% Check
      if (autoCashoutEnabled && !cashedOut100 && currentMult >= autoCashoutValue) {
        handleCashout100(currentMult);
      }

      if (currentMult >= randomCrash) {
        setMultiplier(randomCrash);
        setPhase('CRASHED');
        setStatusText(`CRASHED PADA ${randomCrash.toFixed(2)}x`);

        // Add to history
        const color =
          randomCrash === 1.0
            ? 'text-rose-400 bg-rose-950/80 border-rose-500/50'
            : randomCrash < 2.0
            ? 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50'
            : randomCrash < 6.0
            ? 'text-purple-400 bg-purple-950/80 border-purple-500/50'
            : 'text-amber-400 bg-amber-950/80 border-amber-500/50';

        setHistory((prev) => [{ mult: randomCrash, color }, ...prev.slice(0, 15)]);

        // Return to WAITING after 3.5s
        setTimeout(() => {
          setPhase('WAITING');
          setStatusText('TARUHAN DITUTUP');
          setHasBet(false);
          setCashedOut50(false);
          setCashedOut100(false);
        }, 3500);
      } else {
        setMultiplier(currentMult);
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const handleCashout50 = (currentMult: number = multiplier) => {
    if (cashedOut50 || cashedOut100 || phase !== 'FLYING' || !user) return;

    setCashedOut50(true);
    const win50 = Math.round((betAmount / 2) * currentMult);
    setRoundWin((prev) => prev + win50);

    const updatedBal = user.balance + win50;
    onBalanceUpdate(updatedBal);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleCashout100 = (currentMult: number = multiplier) => {
    if (cashedOut100 || phase !== 'FLYING' || !user) return;

    setCashedOut100(true);
    const activeBet = cashedOut50 ? betAmount / 2 : betAmount;
    const finalWin = Math.round(activeBet * currentMult);
    setRoundWin((prev) => prev + finalWin);

    const updatedBal = user.balance + finalWin;
    onBalanceUpdate(updatedBal);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { user: user?.username || 'Saya', text: chatInput, color: 'text-cyan-300' }]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 bg-black/92 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#18052b] via-[#0d0219] to-[#05000a] border-2 border-purple-500/60 rounded-3xl shadow-[0_0_80px_rgba(168,85,247,0.35)] p-2 sm:p-4 flex flex-col my-auto max-h-[98vh] overflow-hidden">
        {/* --- HEADER --- */}
        <div className="relative z-10 flex items-center justify-between pb-2 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <button className="px-3 py-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white text-xs font-black rounded-xl border border-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.6)] flex items-center gap-1 hover:scale-105 active:scale-95 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              + FITUR !!
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-purple-200">
              <span className="font-bold text-white">Spaceman</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">👥 3.815 Pemain</span>
              <span className="text-stone-400 text-[10px]">(Rp 2.000 - 1.500.000)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Join Group */}
            <a
              href="https://chat.whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-black rounded-xl border border-emerald-300 shadow-[0_0_15px_rgba(34,197,94,0.6)] flex items-center gap-1 transition-all"
            >
              <span>💬</span>
              Join Group
            </a>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-500/30"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-500/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- MAIN GAME STAGE (COSMOS VIEW) --- */}
        <div className="relative z-10 grid grid-cols-12 gap-2 my-2 min-h-[300px] sm:min-h-[340px]">
          {/* Left Bracket Multipliers */}
          <div className="col-span-2 hidden sm:flex flex-col justify-around py-2">
            <div className="p-2 rounded-2xl bg-gradient-to-r from-purple-950 to-slate-900 border-2 border-yellow-500/70 shadow-[0_0_15px_rgba(234,179,8,0.3)] text-center">
              <div className="text-[10px] text-stone-400">PLANET</div>
              <div className="text-sm font-black text-amber-300">1.00x</div>
            </div>
            <div className="p-2 rounded-2xl bg-gradient-to-r from-purple-950 to-slate-900 border-2 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-center">
              <div className="text-sm font-black text-cyan-300">1.01x - 1.99x</div>
            </div>
            <div className="p-2 rounded-2xl bg-gradient-to-r from-purple-950 to-slate-900 border-2 border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-center">
              <div className="text-sm font-black text-purple-300">2.00x - 5.99x</div>
            </div>
          </div>

          {/* Central Space Canvas */}
          <div className="col-span-12 sm:col-span-7 relative bg-gradient-to-b from-[#1b0333] via-[#100124] to-[#0a0017] border-2 border-purple-500/40 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
            {/* Cosmos Background Stars & Planets */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-6 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-800 opacity-60 blur-xs" />
            <div className="absolute bottom-8 left-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-rose-700 opacity-70 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
            <div className="absolute top-8 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-sky-600 via-indigo-700 to-purple-900 opacity-50 blur-xs" />

            {/* Floating Alien UFO */}
            <div className="relative z-10 mb-2 flex flex-col items-center animate-bounce">
              <div className="w-24 h-10 rounded-[100%] bg-gradient-to-r from-cyan-400 via-slate-200 to-cyan-500 border-2 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.8)] flex items-center justify-center">
                <div className="w-10 h-6 -mt-4 rounded-t-full bg-cyan-300/80 border border-white" />
              </div>
              {/* Traction Light Ray */}
              {phase === 'WAITING' && (
                <div className="w-20 h-28 bg-gradient-to-b from-rose-500/70 via-rose-500/20 to-transparent clip-path-polygon opacity-80" />
              )}
            </div>

            {/* Astronaut Character */}
            <div className={`relative z-10 transition-all duration-300 ${phase === 'FLYING' ? 'scale-110 -translate-y-4' : ''}`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 p-1 shadow-[0_0_30px_rgba(168,85,247,0.8)] flex items-center justify-center animate-pulse">
                <img
                  src="/games/spaceman.png"
                  alt="Spaceman"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-4xl">👨‍🚀</span>
              </div>
              {phase === 'FLYING' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-t from-transparent via-amber-400 to-yellow-300 rounded-full blur-xs animate-ping" />
              )}
            </div>

            {/* Multiplier / Status Text */}
            <div className="relative z-10 mt-3 text-center">
              {phase === 'WAITING' ? (
                <div className="text-xl sm:text-2xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                  {statusText}
                </div>
              ) : phase === 'FLYING' ? (
                <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_25px_rgba(245,158,11,1)]">
                  {multiplier.toFixed(2)}x
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl font-black text-rose-500 tracking-wider drop-shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-pulse">
                  {statusText}
                </div>
              )}
            </div>
          </div>

          {/* Right Live Chat & Top Multipliers */}
          <div className="col-span-12 sm:col-span-3 flex flex-col gap-2">
            {/* High Multiplier Badges */}
            <div className="hidden sm:grid grid-cols-3 gap-1">
              <div className="p-1 rounded-xl bg-purple-950/80 border border-purple-500/50 text-center text-[10px] font-bold text-purple-300">
                6.00x - 25.99x
              </div>
              <div className="p-1 rounded-xl bg-purple-950/80 border border-purple-500/50 text-center text-[10px] font-bold text-pink-300">
                26.00x - 100.99x
              </div>
              <div className="p-1 rounded-xl bg-purple-950/80 border border-yellow-500/50 text-center text-[10px] font-bold text-amber-300">
                101x - 4999.9x
              </div>
            </div>

            {/* Live Chat Box */}
            <div className="flex-1 bg-black/60 border border-purple-500/40 rounded-2xl p-2 flex flex-col h-44 sm:h-auto overflow-hidden">
              <div className="text-[10px] font-bold text-purple-300 pb-1 border-b border-purple-500/20 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Live Chat Pemain
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 py-1 text-[11px]">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="leading-tight">
                    <span className={`font-bold ${msg.color || 'text-purple-300'}`}>{msg.user}: </span>
                    <span className="text-stone-300">{msg.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-1 pt-1 border-t border-purple-500/20">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ketikkan pesan di sini..."
                  className="flex-1 px-2 py-1 bg-stone-900 border border-purple-500/30 rounded-lg text-[10px] text-white focus:outline-hidden"
                />
                <button type="submit" className="p-1 bg-purple-600 rounded-lg text-white">
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* --- CONTROL DOCK: TARUHAN, AUTO CASHOUT & TOMBOL AKSI --- */}
        <div className="relative z-10 bg-[#0c0316] border border-purple-500/40 rounded-2xl p-2.5 sm:p-3 mt-auto">
          {/* Row 1: Auto Cashout Toggles & Quick Bet Pills */}
          <div className="grid grid-cols-12 gap-2 mb-2 items-center">
            {/* Auto Cashout 100% & 50% Controls */}
            <div className="col-span-12 sm:col-span-5 flex flex-col gap-1.5 bg-black/40 p-2 rounded-xl border border-purple-500/20">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCashoutEnabled}
                    onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                    className="rounded accent-purple-500"
                  />
                  Cairkan Otomatis (100%)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAutoCashoutValue((v) => Math.max(1.1, Number((v - 0.1).toFixed(2))))}
                    className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-500/40 font-bold"
                  >
                    -
                  </button>
                  <span className="font-black text-amber-300 text-xs w-12 text-center">{autoCashoutValue.toFixed(2)}x</span>
                  <button
                    onClick={() => setAutoCashoutValue((v) => Number((v + 0.1).toFixed(2)))}
                    className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-500/40 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCashout50Enabled}
                    onChange={(e) => setAutoCashout50Enabled(e.target.checked)}
                    className="rounded accent-pink-500"
                  />
                  Cairkan Otomatis 50%
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAutoCashout50Value((v) => Math.max(1.1, Number((v - 0.1).toFixed(2))))}
                    className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-500/40 font-bold"
                  >
                    -
                  </button>
                  <span className="font-black text-pink-300 text-xs w-12 text-center">{autoCashout50Value.toFixed(2)}x</span>
                  <button
                    onClick={() => setAutoCashout50Value((v) => Number((v + 0.1).toFixed(2)))}
                    className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-500/40 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Bets & Stepper */}
            <div className="col-span-12 sm:col-span-7 flex flex-wrap items-center justify-between sm:justify-end gap-1.5">
              {[2000, 10000, 50000, 200000].map((amt) => (
                <button
                  key={amt}
                  disabled={phase === 'FLYING'}
                  onClick={() => setBetAmount(amt)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    betAmount === amt
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-stone-950 border border-yellow-200 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-purple-950/80 text-purple-300 hover:text-white border border-purple-500/40'
                  }`}
                >
                  +{amt >= 1000 ? `Rp${amt / 1000}K` : amt}
                </button>
              ))}

              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-purple-500/40">
                <span className="text-[11px] text-stone-400">Taruhan:</span>
                <span className="text-xs font-black text-amber-400">Rp {betAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Action Buttons */}
          <div className="grid grid-cols-12 gap-2 items-center">
            {/* Saldo info */}
            <div className="col-span-4 text-xs text-stone-300">
              <div>
                Saldo: <strong className="text-amber-400">Rp {user ? user.balance.toLocaleString('id-ID') : '0'}</strong>
              </div>
              <div className="text-[10px] text-stone-400">
                Total Menang: <strong className="text-emerald-400">Rp {roundWin.toLocaleString('id-ID')}</strong>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="col-span-8 flex gap-2">
              {!user ? (
                <button
                  onClick={onOpenLogin}
                  className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-stone-950" />
                  LOGIN UNTUK BERMAIN
                </button>
              ) : phase === 'WAITING' ? (
                <button
                  onClick={handlePlaceBetAndStart}
                  className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:brightness-110 active:scale-95 border border-yellow-200 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 fill-stone-950" />
                  PASANG TARUHAN (Rp {betAmount.toLocaleString('id-ID')})
                </button>
              ) : phase === 'FLYING' ? (
                <div className="w-full flex gap-2">
                  <button
                    disabled={cashedOut50 || cashedOut100}
                    onClick={() => handleCashout50()}
                    className={`flex-1 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all ${
                      cashedOut50
                        ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] hover:brightness-110 active:scale-95 border border-pink-300'
                    }`}
                  >
                    {cashedOut50
                      ? '50% DICAIRKAN'
                      : `CAIRKAN 50% (Rp ${Math.round((betAmount / 2) * multiplier).toLocaleString('id-ID')})`}
                  </button>

                  <button
                    disabled={cashedOut100}
                    onClick={() => handleCashout100()}
                    className={`flex-1 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all ${
                      cashedOut100
                        ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-green-500 text-stone-950 shadow-[0_0_20px_rgba(34,197,94,0.7)] hover:brightness-110 active:scale-95 border border-emerald-200'
                    }`}
                  >
                    {cashedOut100
                      ? 'DICAIRKAN'
                      : `CAIRKAN SEMUA (Rp ${Math.round((cashedOut50 ? betAmount / 2 : betAmount) * multiplier).toLocaleString('id-ID')})`}
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-black text-sm bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  MENUNGGU RONDE BERIKUTNYA...
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- BOTTOM MULTIPLIER HISTORY RIBBON --- */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto py-2 px-1 mt-1 border-t border-purple-500/20">
          <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 whitespace-nowrap">
            DIMAIKAN
          </span>
          {history.map((item, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-lg text-xs font-black border whitespace-nowrap ${item.color}`}
            >
              {item.mult.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
