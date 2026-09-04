import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ChevronLeft, ChevronRight, RefreshCw, BarChart2 } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface Props {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenDeposit: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

type Phase = 'WAITING' | 'FLYING' | 'CRASHED';

interface HistItem { mult: number; }
interface ChatMsg { user: string; text: string; color: string; ts: number; }
interface LeaderRow { user: string; bet: number; mult: number; win: number; }

// ── Fake data ────────────────────────────────────────────────────────────────
const FAKE_HIST: HistItem[] = [
  3.02, 1.22, 8.53, 3.33, 1.35, 1.01, 8.32, 1.11, 10.96, 8.84,
  4.60, 2.93, 2.38, 5.71, 4.68, 2.02, 7.76
].map(m => ({ mult: m }));

const FAKE_NAMES = ['Jake8677','Raelson','Splendid','user_4477','lucky88','CrashKing','BetBoss','AstroWin'];
const FAKE_CHATS: ChatMsg[] = [
  { user: 'Jake8677', text: 'GAS TERUS BROOO', color: '#a78bfa', ts: 0 },
  { user: 'Raelson', text: 'lagi hot nih semua menang', color: '#34d399', ts: 1 },
  { user: 'Splendid', text: '3x cashout nice', color: '#fbbf24', ts: 2 },
  { user: 'user_4477', text: 'mau 10x dulu hahaha', color: '#f9a8d4', ts: 3 },
  { user: 'lucky88', text: 'kena crash 1.01 lagi :(', color: '#94a3b8', ts: 4 },
  { user: 'CrashKing', text: 'tunggu 5x bro pasti ketemu', color: '#a78bfa', ts: 5 },
];
const BOT_MSGS = [
  'GAS GAS GAS!!!','Kena 1x lagi nangis','Ya Allah 20x mana???','Mantap brooo',
  'cashout 2x aman','Lanjut lanjut','Semangat kawan2','hampir saja haha',
  '5x minggu ini udah 3 kali','Biasanya abis crash langsung tinggi',
];

const FAKE_LEADERS: LeaderRow[] = [
  { user: 'Jake8677', bet: 161503, mult: 1.22, win: 167165 },
  { user: 'Raelson', bet: 50000, mult: 1.22, win: 61076 },
  { user: 'Splendid', bet: 2080, mult: 1.21, win: 2438 },
];

const LEFT_RANGES = [
  { range: '1.00x', color: '#facc15', bg: '#1a1000', border: '#854d0e' },
  { range: '1.01x - 1.99x', color: '#22d3ee', bg: '#001a1f', border: '#0e7490' },
  { range: '2.00x - 5.99x', color: '#c084fc', bg: '#1a0033', border: '#7e22ce' },
];
const RIGHT_RANGES = [
  { range: '6.00x\n25.99x', color: '#c084fc', bg: '#1a0033', border: '#7e22ce' },
  { range: '26.00x\n100.99x', color: '#f472b6', bg: '#2d001a', border: '#be185d' },
  { range: '101x\n4999.99x', color: '#fbbf24', bg: '#1f1200', border: '#92400e' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function multColor(m: number) {
  if (m <= 1.0) return '#f87171';
  if (m < 2.0) return '#22d3ee';
  if (m < 6.0) return '#c084fc';
  if (m < 26.0) return '#f472b6';
  return '#fbbf24';
}

function randCrash(): number {
  const r = Math.random();
  if (r < 0.08) return Number((1 + Math.random() * 0.05).toFixed(2));
  if (r < 0.55) return Number((1.05 + Math.random() * 0.9).toFixed(2));
  if (r < 0.80) return Number((2 + Math.random() * 4).toFixed(2));
  if (r < 0.93) return Number((6 + Math.random() * 20).toFixed(2));
  if (r < 0.99) return Number((26 + Math.random() * 75).toFixed(2));
  return Number((101 + Math.random() * 400).toFixed(2));
}

// ── Star background ──────────────────────────────────────────────────────────
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.5 + 0.3,
  o: Math.random() * 0.7 + 0.3,
  dur: Math.random() * 3 + 1.5,
}));

// ── Main component ───────────────────────────────────────────────────────────
export const SpacemanGameModal: React.FC<Props> = ({
  isOpen, user, onClose, onOpenLogin, onOpenDeposit, onBalanceUpdate,
}) => {
  const [bet, setBet] = useState(2000);
  const [phase, setPhase] = useState<Phase>('WAITING');
  const [mult, setMult] = useState(1.0);
  const [crashAt, setCrashAt] = useState(2.0);
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [roundWin, setRoundWin] = useState(0);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutVal, setAutoCashoutVal] = useState(2.0);
  const [autoCashout50, setAutoCashout50] = useState(false);
  const [autoCashout50Val, setAutoCashout50Val] = useState(1.5);
  const [cashedOut50, setCashedOut50] = useState(false);
  const [history, setHistory] = useState<HistItem[]>(FAKE_HIST);
  const [chat, setChat] = useState<ChatMsg[]>(FAKE_CHATS);
  const [chatInput, setChatInput] = useState('');
  const [leaders, setLeaders] = useState<LeaderRow[]>(FAKE_LEADERS);

  // Astronaut position state (0 = bottom-center, moves toward top-right in a curve)
  const [astroT, setAstroT] = useState(0); // 0-1 progress along flight path
  const [waiting, setWaiting] = useState(5);

  const animRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const crashRef = useRef(2.0);
  const multRef = useRef(1.0);
  const cashedOutRef = useRef(false);
  const cashedOut50Ref = useRef(false);
  const balRef = useRef(user?.balance ?? 0);
  const phaseRef = useRef<Phase>('WAITING');

  // Keep balance ref in sync
  useEffect(() => { balRef.current = user?.balance ?? 0; }, [user?.balance]);

  // Auto-generate bot messages
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => {
      const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
      const text = BOT_MSGS[Math.floor(Math.random() * BOT_MSGS.length)];
      const colors = ['#a78bfa','#34d399','#fbbf24','#f9a8d4','#94a3b8','#22d3ee'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      setChat(p => [...p.slice(-40), { user: name, text, color, ts: Date.now() }]);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [isOpen]);

  // Game loop
  const startFlight = useCallback(() => {
    const cp = randCrash();
    crashRef.current = cp;
    setCrashAt(cp);
    setPhase('FLYING');
    phaseRef.current = 'FLYING';
    setMult(1.0);
    setAstroT(0);
    startRef.current = performance.now();
    multRef.current = 1.0;

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      
      // Progressive acceleration curve:
      // - At 1.00x - 1.50x: starts moderately slow for suspense (~2.5s buildup)
      // - At 1.50x - 3.00x: picks up steady momentum
      // - At 3.00x - 10.0x: accelerating fast
      // - At 10x - 50x - 100x+: rocket supersonic climb!
      const currentMult = Number((
        1 +
        0.06 * elapsed +
        0.038 * Math.pow(elapsed, 2) +
        0.0055 * Math.pow(elapsed, 3) +
        0.00065 * Math.pow(elapsed, 4)
      ).toFixed(2));

      // Astronaut ascends smoothly along flight trajectory then hovers in high orbit
      const flightProgress = Math.min(0.85, 1 - Math.exp(-elapsed / 2.8));
      const zeroGHover = Math.sin(elapsed * 3.5) * 0.015;
      const t = Math.min(0.92, flightProgress + zeroGHover);

      multRef.current = currentMult;
      setMult(currentMult);
      setAstroT(t);

      // Auto cashout checks
      if (autoCashout50 && !cashedOut50Ref.current && currentMult >= autoCashout50Val) {
        doCashout50(currentMult);
      }
      if (autoCashout && !cashedOutRef.current && currentMult >= autoCashoutVal) {
        doCashout(currentMult);
      }

      if (currentMult >= crashRef.current) {
        // CRASH
        setPhase('CRASHED');
        phaseRef.current = 'CRASHED';
        setMult(crashRef.current);
        setAstroT(1);
        setHistory(p => [{ mult: crashRef.current }, ...p.slice(0, 20)]);

        setTimeout(() => {
          setPhase('WAITING');
          phaseRef.current = 'WAITING';
          setHasBet(false);
          setCashedOut(false);
          cashedOutRef.current = false;
          setCashedOut50(false);
          cashedOut50Ref.current = false;
          setMult(1.0);
          setAstroT(0);
          setRoundWin(0);
          // Waiting countdown
          let w = 5;
          setWaiting(w);
          const countdown = setInterval(() => {
            w--;
            setWaiting(w);
            if (w <= 0) { clearInterval(countdown); startFlight(); }
          }, 1000);
        }, 2500);
        return;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [autoCashout, autoCashoutVal, autoCashout50, autoCashout50Val]);

  // Start game on mount
  useEffect(() => {
    if (!isOpen) return;
    let w = 5; setWaiting(w);
    const id = setInterval(() => {
      w--; setWaiting(w);
      if (w <= 0) { clearInterval(id); startFlight(); }
    }, 1000);
    return () => {
      clearInterval(id);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function doCashout(currentMult = multRef.current) {
    if (cashedOutRef.current || phaseRef.current !== 'FLYING' || !hasBet) return;
    cashedOutRef.current = true;
    setCashedOut(true);
    const activeBet = cashedOut50Ref.current ? bet / 2 : bet;
    const win = Math.round(activeBet * currentMult);
    setRoundWin(p => p + win);
    const newBal = balRef.current + win;
    balRef.current = newBal;
    onBalanceUpdate(newBal);
  }

  function doCashout50(currentMult = multRef.current) {
    if (cashedOut50Ref.current || cashedOutRef.current || phaseRef.current !== 'FLYING' || !hasBet) return;
    cashedOut50Ref.current = true;
    setCashedOut50(true);
    const win = Math.round((bet / 2) * currentMult);
    setRoundWin(p => p + win);
    const newBal = balRef.current + win;
    balRef.current = newBal;
    onBalanceUpdate(newBal);
  }

  function placeBet() {
    if (!user) { onOpenLogin(); return; }
    if ((user.balance) < bet) { onOpenDeposit(); return; }
    if (phase !== 'WAITING') return;
    const newBal = user.balance - bet;
    onBalanceUpdate(newBal);
    balRef.current = newBal;
    setHasBet(true);
  }

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChat(p => [...p.slice(-40), {
      user: user?.username || 'Saya', text: chatInput.trim(),
      color: '#22d3ee', ts: Date.now()
    }]);
    setChatInput('');
  }

  // Astronaut SVG path: starts bottom-center (50%, 80%), curves up-right
  // Using a quadratic bezier: start(50,80) control(70,20) end(90,5)
  const px = (t: number) => 50 + t * 40 + t * (1 - t) * 20; // x %
  const py = (t: number) => 80 - t * 75 - t * (1 - t) * 20; // y %
  const astroX = px(astroT);
  const astroY = py(astroT);

  // Dashed trail: path from start to current position
  const trailPoints = Array.from({ length: 20 }, (_, i) => {
    const ti = (i / 19) * astroT;
    return `${px(ti)}%,${py(ti)}%`;
  }).join(' ');

  const multDisplay = mult.toFixed(2);
  const isCrashed = phase === 'CRASHED';
  const isFlying = phase === 'FLYING';
  const isWaiting = phase === 'WAITING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden"
      style={{ fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ── OUTER SHELL ── */}
      <div className="relative w-full h-full flex flex-col"
        style={{ background: 'linear-gradient(180deg,#12003a 0%,#1a0050 40%,#0d0030 100%)' }}>

        {/* ── STARS ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {STARS.map((s, i) => (
            <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o}>
              <animate attributeName="opacity" values={`${s.o};${s.o * 0.3};${s.o}`} dur={`${s.dur}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* ── HEADER BAR ── */}
        <div className="relative z-10 flex items-center justify-between px-3 py-2 border-b border-purple-800/40"
          style={{ background: 'rgba(10,0,30,0.7)' }}>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 text-xs font-black text-white rounded-lg border border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
              + FITUR
            </button>
            <span className="text-white font-bold text-sm">Spaceman</span>
            <span className="text-emerald-400 text-xs">• ⬟ 5.058</span>
            <span className="text-purple-300 text-[10px] hidden sm:block">Rp 2.000 – 1.500.000 ▾</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://chat.whatsapp.com" target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white rounded-xl border border-emerald-400 cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
              💬 Join Group
            </a>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── MAIN GAME AREA ── */}
        <div className="relative flex-1 flex overflow-hidden min-h-0">

          {/* Left column – history range badges */}
          <div className="hidden sm:flex flex-col justify-around px-2 py-3 w-24 shrink-0 gap-2">
            {LEFT_RANGES.map((r, i) => (
              <div key={i} className="rounded-xl p-2 text-center text-[10px] font-black border"
                style={{ background: r.bg, borderColor: r.border, color: r.color }}>
                {r.range}
              </div>
            ))}
          </div>

          {/* Center – space canvas */}
          <div className="relative flex-1 overflow-hidden">
            {/* Space glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />

            {/* Big planet */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ width: 140, height: 140, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #60a5fa, #1e3a8a 50%, #0f172a)',
                boxShadow: '0 0 40px rgba(59,130,246,0.3)',
                top: isFlying ? '5%' : '8%', transition: 'top 0.5s ease'
              }} />

            {/* Dashed trail */}
            {(isFlying || isCrashed) && astroT > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                <polyline
                  points={trailPoints}
                  fill="none"
                  stroke="rgba(251,191,36,0.6)"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
              </svg>
            )}

            {/* Astronaut */}
            {!isCrashed && (
              <div
                className="absolute z-10"
                style={{
                  left: `calc(${astroX}% - 36px)`,
                  top: `calc(${astroY}% - 36px)`,
                  transition: 'none',
                  transform: `rotate(${isFlying ? -32 + Math.sin(astroT * 8) * 4 : 0}deg)`,
                }}
              >
                {/* Astronaut body */}
                <div className="relative" style={{ width: 72, height: 72 }}>
                  <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width={72} height={72}>
                    {/* Cape */}
                    <ellipse cx="36" cy="58" rx="20" ry="10" fill="#c2410c" opacity="0.9"/>
                    {/* Suit body */}
                    <rect x="20" y="32" width="32" height="28" rx="10" fill="#e2e8f0"/>
                    {/* Helmet */}
                    <circle cx="36" cy="26" r="18" fill="#c7d2fe" stroke="#818cf8" strokeWidth="2"/>
                    {/* Visor */}
                    <ellipse cx="36" cy="26" rx="12" ry="11" fill="#3730a3" opacity="0.85"/>
                    {/* Visor glare */}
                    <ellipse cx="30" cy="22" rx="3" ry="2" fill="white" opacity="0.5"/>
                    {/* Eyes glow */}
                    <circle cx="31" cy="26" r="2" fill="#60a5fa"/>
                    <circle cx="41" cy="26" r="2" fill="#60a5fa"/>
                    {/* Jetpack */}
                    <rect x="14" y="36" width="8" height="16" rx="4" fill="#64748b"/>
                    <rect x="50" y="36" width="8" height="16" rx="4" fill="#64748b"/>
                    {/* Arm */}
                    <rect x="9" y="38" width="14" height="8" rx="4" fill="#e2e8f0"/>
                    <rect x="49" y="38" width="14" height="8" rx="4" fill="#e2e8f0"/>
                    {/* Stars on suit */}
                    <polygon points="36,35 37.2,38.6 41,38.6 38,40.7 39.2,44.4 36,42.3 32.8,44.4 34,40.7 31,38.6 34.8,38.6" fill="#fbbf24"/>
                  </svg>
                  {/* Jetpack flames */}
                  {isFlying && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      <div className="rounded-full animate-pulse"
                        style={{ width: 10, height: Math.min(36, 18 + mult * 0.4), background: 'linear-gradient(180deg,#fbbf24,#f97316,transparent)', opacity: 0.95 }} />
                      <div className="rounded-full animate-pulse" style={{ animationDelay: '0.12s',
                        width: 10, height: Math.min(36, 18 + mult * 0.4), background: 'linear-gradient(180deg,#fbbf24,#f97316,transparent)', opacity: 0.95 }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CRASHED astronaut – tumbling */}
            {isCrashed && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div style={{ animation: 'spin 1s linear infinite', opacity: 0.6, width: 60, height: 60 }}>
                  <svg viewBox="0 0 72 72" width={60} height={60}>
                    <ellipse cx="36" cy="58" rx="20" ry="10" fill="#c2410c" opacity="0.7"/>
                    <rect x="20" y="32" width="32" height="28" rx="10" fill="#e2e8f0"/>
                    <circle cx="36" cy="26" r="18" fill="#c7d2fe" stroke="#818cf8" strokeWidth="2"/>
                    <ellipse cx="36" cy="26" rx="12" ry="11" fill="#3730a3" opacity="0.85"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Multiplier / status overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20" style={{ top: '50%' }}>
              {isWaiting && (
                <div className="text-center">
                  <div className="text-white font-black text-xl sm:text-3xl tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
                    TUNGGU PERMAINAN BERIKUTNYA
                  </div>
                  <div className="text-purple-300 text-sm mt-1">{waiting}s</div>
                </div>
              )}
              {isFlying && (
                <div
                  className="font-black drop-shadow-[0_0_30px_rgba(251,191,36,1)]"
                  style={{
                    fontSize: 'clamp(2.5rem,8vw,5rem)',
                    background: 'linear-gradient(135deg,#fde68a,#fbbf24,#f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {multDisplay}x
                </div>
              )}
              {isCrashed && (
                <div className="text-center">
                  <div className="text-red-500 font-black text-2xl sm:text-4xl tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse">
                    CRASHED!
                  </div>
                  <div className="text-red-400 font-black text-xl">{crashAt.toFixed(2)}x</div>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="hidden sm:flex flex-col w-56 shrink-0 gap-2 p-2">
            {/* Multiplier range badges */}
            <div className="flex flex-col gap-1">
              {RIGHT_RANGES.map((r, i) => (
                <div key={i} className="rounded-xl px-2 py-2 text-center text-[10px] font-black border whitespace-pre-line leading-tight"
                  style={{ background: r.bg, borderColor: r.border, color: r.color }}>
                  {r.range}
                </div>
              ))}
            </div>

            {/* Live chat */}
            <div className="flex-1 flex flex-col rounded-xl border border-purple-700/40 overflow-hidden min-h-0"
              style={{ background: 'rgba(10,0,30,0.7)' }}>
              <div className="px-2 py-1.5 text-[10px] font-bold text-purple-300 border-b border-purple-700/30 flex items-center gap-1 shrink-0">
                💬 Chat Publik
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 text-[11px]" id="chat-scroll">
                {chat.map((m, i) => (
                  <div key={i} className="leading-snug">
                    <span className="font-bold" style={{ color: m.color }}>{m.user}: </span>
                    <span className="text-stone-300">{m.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} className="flex gap-1 px-2 py-1.5 border-t border-purple-700/30 shrink-0">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-2 py-1 rounded-lg text-[10px] text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(139,92,246,0.3)' }} />
                <button type="submit" className="p-1.5 rounded-lg cursor-pointer"
                  style={{ background: '#7c3aed' }}>
                  <Send className="w-3 h-3 text-white" />
                </button>
              </form>
            </div>

            {/* Leaderboard mini table */}
            <div className="rounded-xl border border-purple-700/40 overflow-hidden shrink-0"
              style={{ background: 'rgba(10,0,30,0.7)' }}>
              <div className="px-2 py-1 text-[9px] font-bold text-purple-300 border-b border-purple-700/30 grid grid-cols-4 gap-1">
                <span>Pengguna</span><span>Taruhan</span><span>Penganda</span><span>Menang</span>
              </div>
              {leaders.map((l, i) => (
                <div key={i} className="px-2 py-1 text-[9px] grid grid-cols-4 gap-1 border-b border-purple-900/30">
                  <span className="text-purple-300 font-bold truncate">{l.user}</span>
                  <span className="text-stone-300">Rp {(l.bet / 1000).toFixed(0)}K</span>
                  <span className="text-cyan-400 font-bold">{l.mult.toFixed(2)}x</span>
                  <span className="text-emerald-400 font-bold">Rp {(l.win / 1000).toFixed(1)}K</span>
                </div>
              ))}
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-stone-500 text-[9px]">3365 👥 88 🟢</span>
                <span className="text-amber-400 font-black text-[9px]">🏆 Rp 1.338.347</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM CONTROL DOCK ── */}
        <div className="relative z-10 shrink-0 border-t border-purple-800/40"
          style={{ background: 'linear-gradient(180deg,rgba(20,0,50,0.95),rgba(8,0,22,0.98))' }}>

          {/* Auto-cashout row */}
          <div className="flex flex-wrap items-center gap-3 px-3 pt-2 pb-1">
            {/* Auto cashout full */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <div onClick={() => setAutoCashout(p => !p)}
                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${autoCashout ? 'bg-purple-600' : 'bg-stone-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoCashout ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="hidden sm:inline">Cairkan Otomatis</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setAutoCashoutVal(v => Math.max(1.1, +(v - 0.1).toFixed(2)))}
                  className="w-5 h-5 rounded bg-purple-900 border border-purple-600 text-purple-300 text-xs flex items-center justify-center cursor-pointer">‹</button>
                <span className="text-amber-400 font-black text-xs w-10 text-center">{autoCashoutVal.toFixed(2)}x</span>
                <button onClick={() => setAutoCashoutVal(v => +(v + 0.1).toFixed(2))}
                  className="w-5 h-5 rounded bg-purple-900 border border-purple-600 text-purple-300 text-xs flex items-center justify-center cursor-pointer">›</button>
              </div>
            </label>

            {/* Auto cashout 50% */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <div onClick={() => setAutoCashout50(p => !p)}
                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${autoCashout50 ? 'bg-pink-600' : 'bg-stone-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoCashout50 ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="hidden sm:inline">Cairkan Otomatis 50%</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setAutoCashout50Val(v => Math.max(1.1, +(v - 0.1).toFixed(2)))}
                  className="w-5 h-5 rounded bg-purple-900 border border-purple-600 text-purple-300 text-xs flex items-center justify-center cursor-pointer">‹</button>
                <span className="text-pink-400 font-black text-xs w-10 text-center">{autoCashout50Val.toFixed(2)}x</span>
                <button onClick={() => setAutoCashout50Val(v => +(v + 0.1).toFixed(2))}
                  className="w-5 h-5 rounded bg-purple-900 border border-purple-600 text-purple-300 text-xs flex items-center justify-center cursor-pointer">›</button>
              </div>
            </label>
          </div>

          {/* Bet + action row */}
          <div className="flex items-center gap-2 px-3 pb-2 flex-wrap sm:flex-nowrap">
            {/* Quick bets */}
            <div className="flex gap-1 shrink-0">
              {[2000, 10000, 50000, 200000].map(a => (
                <button key={a} disabled={isFlying}
                  onClick={() => setBet(a)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${bet === a ? 'text-stone-950' : 'text-purple-300 border border-purple-700'}`}
                  style={bet === a ? { background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 10px rgba(251,191,36,0.4)' } : { background: 'rgba(88,28,135,0.5)' }}>
                  +{a >= 1000 ? `Rp${a / 1000}K` : a}
                </button>
              ))}
            </div>

            {/* Bet stepper */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-purple-700 shrink-0"
              style={{ background: 'rgba(20,0,50,0.8)' }}>
              <button onClick={() => setBet(b => Math.max(2000, b - 1000))} disabled={isFlying}
                className="p-0.5 text-purple-400 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <div className="text-center px-2">
                <div className="text-[9px] text-purple-400">Taruhan</div>
                <div className="text-sm font-black text-amber-400">Rp {bet.toLocaleString('id-ID')}</div>
              </div>
              <button onClick={() => setBet(b => Math.min(1500000, b + 1000))} disabled={isFlying}
                className="p-0.5 text-purple-400 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>

            {/* Quick add bets */}
            {[50000, 200000].map(a => (
              <button key={a} disabled={isFlying}
                onClick={() => setBet(b => Math.min(1500000, b + a))}
                className="px-2 py-1.5 rounded-xl text-xs font-black text-purple-300 border border-purple-700 cursor-pointer hidden sm:block"
                style={{ background: 'rgba(88,28,135,0.5)' }}>
                +Rp{a / 1000}K
              </button>
            ))}

            {/* Main action */}
            <div className="flex-1 flex gap-2 min-w-0">
              {/* Saldo info / SALDO RENDAH */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-red-800 text-xs shrink-0"
                style={{ background: 'rgba(127,29,29,0.5)' }}>
                <BarChart2 className="w-3 h-3 text-red-400" />
                <span className="text-red-300 font-bold">
                  {user && user.balance < bet ? 'SALDO RENDAH' : `SALDO: Rp ${((user?.balance ?? 0) / 1000).toFixed(0)}K`}
                </span>
              </div>

              {/* 50% cashout */}
              {isFlying && hasBet && !cashedOut50 && !cashedOut && (
                <button onClick={() => doCashout50()}
                  className="flex-1 py-2 rounded-xl text-xs font-black text-white cursor-pointer transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#be185d,#9f1239)', boxShadow: '0 0 15px rgba(244,63,94,0.4)' }}>
                  CAIRKAN 50%<br />
                  <span className="text-[10px]">≈ Rp {Math.round((bet / 2) * mult).toLocaleString('id-ID')}</span>
                </button>
              )}

              {/* Main bet / cashout */}
              {!user ? (
                <button onClick={onOpenLogin}
                  className="flex-1 py-2 rounded-xl font-black text-sm text-stone-950 cursor-pointer transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 20px rgba(251,191,36,0.5)' }}>
                  LOGIN UNTUK BERMAIN
                </button>
              ) : isWaiting && !hasBet ? (
                <button onClick={placeBet}
                  className="flex-1 py-2 rounded-xl font-black text-sm text-stone-950 cursor-pointer transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 20px rgba(251,191,36,0.5)' }}>
                  PASANG TARUHAN
                </button>
              ) : isWaiting && hasBet ? (
                <button disabled
                  className="flex-1 py-2 rounded-xl font-black text-sm cursor-not-allowed"
                  style={{ background: 'rgba(20,0,50,0.8)', color: '#a78bfa', border: '1px solid #7c3aed' }}>
                  MENUNGGU... {waiting}s
                </button>
              ) : isFlying && hasBet && !cashedOut ? (
                <button onClick={() => doCashout()}
                  className="flex-1 py-2 rounded-xl font-black text-sm cursor-pointer transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 0 20px rgba(34,197,94,0.5)', color: 'white' }}>
                  CAIRKAN SEMUA<br />
                  <span className="text-xs">≈ Rp {Math.round((cashedOut50 ? bet / 2 : bet) * mult).toLocaleString('id-ID')}</span>
                </button>
              ) : isFlying && hasBet && cashedOut ? (
                <button disabled className="flex-1 py-2 rounded-xl font-black text-sm cursor-not-allowed text-emerald-400 border border-emerald-700"
                  style={{ background: 'rgba(6,78,59,0.4)' }}>
                  ✓ DICAIRKAN +Rp {roundWin.toLocaleString('id-ID')}
                </button>
              ) : isCrashed ? (
                <button disabled className="flex-1 py-2 rounded-xl font-black text-sm cursor-not-allowed"
                  style={{ background: 'rgba(127,29,29,0.5)', color: '#f87171', border: '1px solid #991b1b' }}>
                  CRASHED {crashAt.toFixed(2)}x
                </button>
              ) : (
                <button disabled className="flex-1 py-2 rounded-xl font-black text-sm cursor-not-allowed text-stone-500 border border-stone-800"
                  style={{ background: 'rgba(20,20,20,0.6)' }}>
                  MENUNGGU RONDE...
                </button>
              )}

              {/* 2x badge & refresh */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-8 h-8 rounded-full border border-purple-600 flex items-center justify-center text-xs font-black text-purple-300 cursor-pointer"
                  style={{ background: 'rgba(88,28,135,0.5)' }}>
                  2x
                </div>
                <div className="w-8 h-8 rounded-full border border-purple-600 flex items-center justify-center cursor-pointer text-purple-300"
                  style={{ background: 'rgba(88,28,135,0.5)' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* ── HISTORY RIBBON ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-purple-900/40"
            style={{ background: 'rgba(5,0,15,0.8)' }}>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)', color: '#fbbf24' }}>
              DIMAINKAN
            </span>
            {history.map((h, i) => (
              <span key={i}
                className="px-2 py-0.5 rounded-lg text-xs font-black whitespace-nowrap shrink-0"
                style={{ color: multColor(h.mult), background: `${multColor(h.mult)}15`, border: `1px solid ${multColor(h.mult)}40` }}>
                {h.mult.toFixed(2)}x
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Spin keyframes */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
