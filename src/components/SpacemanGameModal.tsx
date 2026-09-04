import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ChevronLeft, ChevronRight, RefreshCw, BarChart2, RotateCcw } from 'lucide-react';
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
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.2) 0%, transparent 75%)' }} />

            {/* ── CENTRAL 3D CRATERED MOON & ROTATING SUNBURST RAYS (persis referensi foto) ── */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              style={{ transform: 'translateY(-4%)' }}>

              {/* Rotating Purple Sunburst Rays behind the Moon */}
              <div
                className="absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-full opacity-60 pointer-events-none"
                style={{
                  background: 'repeating-conic-gradient(from 0deg, #4c1d95 0deg 15deg, #1e003a 15deg 30deg)',
                  animation: 'spin 35s linear infinite',
                  filter: 'blur(1px)',
                }}
              />

              {/* Blue 3D Cratered Moon Container */}
              <div className="relative flex items-center justify-center">
                <img
                  src="/games/spaceman_moon.png"
                  alt="Spaceman Blue Moon"
                  className="w-52 h-52 sm:w-68 sm:h-68 object-contain drop-shadow-[0_0_45px_rgba(37,99,235,0.7)] select-none"
                />

                {/* Multiplier / Status in front of the Moon (exact gold font styling with navy drop shadow) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20">
                  {isWaiting && (
                    <div className="text-center px-4">
                      <div className="text-white font-black text-xs sm:text-sm tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-pulse uppercase">
                        TUNGGU PERMAINAN BERIKUTNYA
                      </div>
                      <div className="text-yellow-400 font-black text-2xl sm:text-4xl mt-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-mono">
                        {waiting}s
                      </div>
                    </div>
                  )}

                  {isFlying && (
                    <div className="flex items-baseline justify-center tracking-tight">
                      <span
                        className="font-black text-5xl sm:text-7xl tracking-tighter select-none"
                        style={{
                          color: '#ffc107',
                          textShadow: '0 4px 0 #0f172a, 0 6px 14px rgba(0,0,0,0.95), 0 0 25px rgba(251,191,36,0.65)',
                          WebkitTextStroke: '2px #78350f',
                          fontFamily: "'Chakra Petch', 'Impact', sans-serif",
                        }}
                      >
                        {multDisplay}x
                      </span>
                    </div>
                  )}

                  {isCrashed && (
                    <div className="text-center px-2">
                      <div
                        className="font-black text-3xl sm:text-5xl tracking-widest animate-pulse uppercase"
                        style={{
                          color: '#ef4444',
                          textShadow: '0 4px 0 #450a0a, 0 6px 16px rgba(0,0,0,0.95), 0 0 30px rgba(239,68,68,0.85)',
                          fontFamily: "'Chakra Petch', sans-serif",
                        }}
                      >
                        CRASHED!
                      </div>
                      <div
                        className="font-black text-xl sm:text-3xl mt-0.5"
                        style={{
                          color: '#fca5a5',
                          textShadow: '0 2px 0 #450a0a, 0 4px 8px rgba(0,0,0,0.9)',
                          fontFamily: "'Chakra Petch', sans-serif",
                        }}
                      >
                        @ {crashAt.toFixed(2)}x
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dashed trail */}
            {(isFlying || isCrashed) && astroT > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
                <polyline
                  points={trailPoints}
                  fill="none"
                  stroke="rgba(251,191,36,0.7)"
                  strokeWidth="3"
                  strokeDasharray="8,5"
                />
              </svg>
            )}

            {/* ── ASTRONAUT CHARACTER (persis referensi Spaceman maskot) ── */}
            {/* 1. WAITING: Spaceman standing with peace sign ✌️ */}
            {isWaiting && (
              <div
                className="absolute z-20 pointer-events-none flex flex-col items-center"
                style={{
                  left: '50%',
                  bottom: '10%',
                  transform: 'translateX(-50%)',
                }}
              >
                <img
                  src="/games/spaceman_standing.png"
                  alt="Spaceman Mascot"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_10px_25px_rgba(139,92,246,0.7)] animate-bounce"
                  style={{ animationDuration: '3.5s' }}
                />
                <div className="w-16 sm:w-24 h-3 rounded-full bg-cyan-400/40 blur-sm -mt-2" />
              </div>
            )}

            {/* 2. FLYING: Spaceman flying smoothly along trajectory with jetpack blast */}
            {isFlying && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `calc(${astroX}% - 44px)`,
                  top: `calc(${astroY}% - 44px)`,
                  transition: 'none',
                  transform: `rotate(${-28 + Math.sin(astroT * 8) * 4}deg)`,
                }}
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                  <img
                    src="/games/spaceman_flying.png"
                    alt="Flying Spaceman"
                    className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                  />
                  {/* Extra animated jetpack flame flare */}
                  <div
                    className="absolute -bottom-2 left-1/4 -translate-x-1/2 rounded-full blur-[2px] animate-pulse"
                    style={{
                      width: 14,
                      height: Math.min(36, 18 + mult * 0.4),
                      background: 'linear-gradient(180deg,#fef08a,#f59e0b,#ef4444,transparent)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* 3. CRASHED: Spaceman spinning out of control */}
            {isCrashed && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `calc(${astroX}% - 38px)`,
                  top: `calc(${astroY}% - 38px)`,
                  animation: 'spin 0.7s linear infinite',
                  opacity: 0.85,
                }}
              >
                <img
                  src="/games/spaceman_flying.png"
                  alt="Crashed Spaceman"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter hue-rotate-180 drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]"
                />
              </div>
            )}
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

        {/* ── BOTTOM CONTROL DOCK (persis referensi Pragmatic Spaceman) ── */}
        <div className="relative z-10 shrink-0 border-t border-purple-800/40"
          style={{ background: 'linear-gradient(180deg, #190038 0%, #0d0020 100%)' }}>

          {/* Top Row: Auto-cashout box on left + Bet presets & Main Bet Action in Center + Right Status */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 px-3 py-2.5">
            
            {/* Left: Auto-Cashout Box (single rounded purple panel) */}
            <div className="rounded-2xl border border-purple-700/50 bg-[#1e053a]/80 p-2 flex flex-col gap-2 shrink-0 shadow-lg min-w-[270px]">
              {/* Row 1: Cairkan Otomatis */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setAutoCashout(p => !p)}>
                  <div className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${autoCashout ? 'bg-purple-600' : 'bg-stone-700/70'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoCashout ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs font-semibold text-purple-200/90">Cairkan Otomatis</span>
                </div>
                <div className="flex items-center rounded-xl bg-[#120026] border border-purple-800/60 overflow-hidden">
                  <button
                    onClick={() => setAutoCashoutVal(v => Math.max(1.1, +(v - 0.1).toFixed(2)))}
                    className="px-2 py-1 text-purple-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-amber-400 font-black text-xs min-w-[46px] text-center font-mono">
                    {autoCashoutVal.toFixed(2)}x
                  </span>
                  <button
                    onClick={() => setAutoCashoutVal(v => +(v + 0.1).toFixed(2))}
                    className="px-2 py-1 text-purple-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Cairkan Otomatis 50% */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setAutoCashout50(p => !p)}>
                  <div className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${autoCashout50 ? 'bg-pink-600' : 'bg-stone-700/70'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoCashout50 ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs font-semibold text-purple-200/90">Cairkan Otomatis 50%</span>
                </div>
                <div className="flex items-center rounded-xl bg-[#120026] border border-purple-800/60 overflow-hidden">
                  <button
                    onClick={() => setAutoCashout50Val(v => Math.max(1.1, +(v - 0.1).toFixed(2)))}
                    className="px-2 py-1 text-purple-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-pink-400 font-black text-xs min-w-[46px] text-center font-mono">
                    {autoCashout50Val.toFixed(2)}x
                  </span>
                  <button
                    onClick={() => setAutoCashout50Val(v => +(v + 0.1).toFixed(2))}
                    className="px-2 py-1 text-purple-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Center: Bet Presets, Bet Stepper, and Action Buttons */}
            <div className="flex-1 flex flex-col items-center gap-2 w-full max-w-2xl">
              
              {/* Row 1: Bet presets & central stepper */}
              <div className="flex items-center justify-center gap-2 w-full flex-wrap">
                {/* Left quick bets */}
                {[2000, 10000].map(amt => (
                  <button
                    key={amt}
                    disabled={isFlying}
                    onClick={() => setBet(amt)}
                    className={`relative px-3.5 py-1.5 rounded-full border text-xs font-black transition-all cursor-pointer shadow-md ${
                      bet === amt
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-amber-300'
                        : 'bg-[#3b0764] hover:bg-[#581c87] text-white border-purple-600/40'
                    }`}
                  >
                    <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center text-[9px] font-black text-stone-950">
                      +
                    </div>
                    Rp{amt / 1000}K
                  </button>
                ))}

                {/* Main Bet Stepper (dark rounded pill) */}
                <div className="flex items-center rounded-2xl bg-[#1d0638] border border-purple-600/50 px-2 py-0.5 shadow-inner">
                  <button
                    onClick={() => setBet(b => Math.max(2000, b - 1000))}
                    disabled={isFlying}
                    className="p-1 text-purple-300 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center px-4">
                    <div className="text-[10px] text-purple-300/80 font-semibold tracking-wide">Taruhan</div>
                    <div className="text-sm sm:text-base font-black text-white font-mono leading-tight">
                      Rp {bet.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button
                    onClick={() => setBet(b => Math.min(1500000, b + 1000))}
                    disabled={isFlying}
                    className="p-1 text-purple-300 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Right quick bets */}
                {[50000, 200000].map(amt => (
                  <button
                    key={amt}
                    disabled={isFlying}
                    onClick={() => setBet(amt)}
                    className={`relative px-3.5 py-1.5 rounded-full border text-xs font-black transition-all cursor-pointer shadow-md ${
                      bet === amt
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-amber-300'
                        : 'bg-[#3b0764] hover:bg-[#581c87] text-white border-purple-600/40'
                    }`}
                  >
                    <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center text-[9px] font-black text-stone-950">
                      +
                    </div>
                    Rp{amt / 1000}K
                  </button>
                ))}
              </div>

              {/* Row 2: Secondary buttons & Main Action oval button */}
              <div className="flex items-center justify-center gap-3 w-full">
                {/* Chart icon */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-[#2a0849] hover:bg-[#3d0e68] border border-purple-600/50 flex items-center justify-center text-purple-300 hover:text-white cursor-pointer shadow-sm transition-colors"
                >
                  <BarChart2 className="w-4 h-4" />
                </button>

                {/* Undo / repeat icon */}
                <button
                  type="button"
                  onClick={() => setBet(2000)}
                  disabled={isFlying}
                  className="w-8 h-8 rounded-full bg-[#2a0849] hover:bg-[#3d0e68] border border-purple-600/50 flex items-center justify-center text-purple-300 hover:text-white cursor-pointer shadow-sm transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Center Main Oval Action Button */}
                <div className="flex-1 max-w-xs flex justify-center">
                  {!user ? (
                    <button
                      onClick={onOpenLogin}
                      className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
                    >
                      LOGIN UNTUK BERMAIN
                    </button>
                  ) : user.balance < bet && !hasBet && isWaiting ? (
                    <div className="px-6 py-2 rounded-full border-2 border-red-600 bg-[#3b0724] text-red-400 font-black text-xs tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.35)] select-none animate-pulse text-center">
                      SALDO RENDAH
                    </div>
                  ) : isWaiting && !hasBet ? (
                    <button
                      onClick={placeBet}
                      className="w-full py-2.5 px-6 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer transition-all active:scale-95"
                    >
                      PASANG TARUHAN
                    </button>
                  ) : isWaiting && hasBet ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 rounded-full bg-purple-950/90 border border-purple-500 text-purple-200 font-black text-xs tracking-wider cursor-not-allowed"
                    >
                      MENUNGGU... {waiting}s
                    </button>
                  ) : isFlying && hasBet && !cashedOut ? (
                    <div className="flex gap-2 w-full">
                      {!cashedOut50 && (
                        <button
                          onClick={() => doCashout50()}
                          className="flex-1 py-1.5 px-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.5)] cursor-pointer active:scale-95 flex flex-col items-center justify-center leading-tight"
                        >
                          <span>CAIRKAN 50%</span>
                          <span className="text-[10px] font-mono opacity-90">Rp {Math.round((bet / 2) * mult).toLocaleString('id-ID')}</span>
                        </button>
                      )}
                      <button
                        onClick={() => doCashout()}
                        className="flex-1 py-1.5 px-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer active:scale-95 flex flex-col items-center justify-center leading-tight"
                      >
                        <span>CAIRKAN SEMUA</span>
                        <span className="text-[10px] font-mono opacity-90">Rp {Math.round((cashedOut50 ? bet / 2 : bet) * mult).toLocaleString('id-ID')}</span>
                      </button>
                    </div>
                  ) : isFlying && hasBet && cashedOut ? (
                    <div className="px-6 py-2 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-black text-xs tracking-wider text-center">
                      ✓ DICAIRKAN +Rp {roundWin.toLocaleString('id-ID')}
                    </div>
                  ) : isCrashed ? (
                    <div className="px-6 py-2 rounded-full bg-red-950/80 border border-red-600 text-red-400 font-black text-xs tracking-wider text-center">
                      CRASHED @ {crashAt.toFixed(2)}x
                    </div>
                  ) : (
                    <div className="px-6 py-2 rounded-full bg-[#1b0730] border border-purple-800/60 text-purple-300/80 font-bold text-xs tracking-wider text-center">
                      MENUNGGU RONDE...
                    </div>
                  )}
                </div>

                {/* 2x multiplier button */}
                <button
                  type="button"
                  onClick={() => setBet(b => Math.min(1500000, b * 2))}
                  disabled={isFlying}
                  className="w-8 h-8 rounded-full bg-[#2a0849] hover:bg-[#3d0e68] border border-purple-600/50 flex items-center justify-center text-xs font-black text-purple-300 hover:text-white cursor-pointer shadow-sm transition-colors disabled:opacity-40"
                >
                  2x
                </button>

                {/* Repeat / auto-play icon */}
                <button
                  type="button"
                  onClick={() => setBet(2000)}
                  disabled={isFlying}
                  className="w-8 h-8 rounded-full bg-[#2a0849] hover:bg-[#3d0e68] border border-purple-600/50 flex items-center justify-center text-purple-300 hover:text-white cursor-pointer shadow-sm transition-colors disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Status (0 👤 | 0 👤 DICAIRKAN Rp 0) */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-stone-300 shrink-0 select-none">
              <span>0 👤</span>
              <span className="text-purple-600">|</span>
              <span className="text-emerald-400">0 👤</span>
              <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                DICAIRKAN
              </span>
              <span className="text-amber-400 font-black font-mono">
                Rp {roundWin.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* ── BOTTOM HISTORY CHEVRON RIBBON (persis referensi foto) ── */}
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-1.5 border-t border-purple-900/50 bg-[#0c0018]/90 select-none custom-scrollbar">
            
            {/* Saldo & Total Taruhan Box */}
            <div className="flex items-center gap-3 px-3 py-1 bg-[#16002c] border border-purple-800/60 rounded-xl shrink-0 shadow-inner">
              <div>
                <div className="text-[9px] text-purple-300/80 font-bold uppercase leading-none">Saldo</div>
                <div className="text-xs font-black text-white font-mono leading-tight mt-0.5">
                  Rp {(user?.balance ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="w-[1px] h-6 bg-purple-900/60" />
              <div>
                <div className="text-[9px] text-purple-300/80 font-bold uppercase leading-none">Total Taruhan</div>
                <div className="text-xs font-black text-white font-mono leading-tight mt-0.5">
                  Rp {hasBet ? bet.toLocaleString('id-ID') : '0'}
                </div>
              </div>
            </div>

            {/* Interconnected Chevron Arrow Badges */}
            <div className="flex items-center overflow-x-auto py-0.5 shrink-0">
              {/* First item: Yellow pill countdown */}
              <div className="bg-yellow-400 text-stone-950 px-3 py-1 rounded-l-full font-black text-xs shrink-0 flex items-center shadow-md select-none mr-0.5">
                {isWaiting ? `${waiting}s` : '5s'}
              </div>

              {/* Multiplier Chevron Chain */}
              {history.map((h, i) => {
                const m = h.mult;
                let grad = 'from-[#0284c7] to-[#0ea5e9] text-white'; // cyan default
                if (m <= 1.05) grad = 'from-[#475569] to-[#334155] text-stone-300';
                else if (m < 2.0) grad = 'from-[#0284c7] to-[#0ea5e9] text-white';
                else if (m < 10.0) grad = 'from-[#7c3aed] to-[#6d28d9] text-white';
                else if (m < 50.0) grad = 'from-[#db2777] to-[#be185d] text-white';
                else grad = 'from-[#f59e0b] to-[#d97706] text-stone-950 font-black';

                return (
                  <div
                    key={i}
                    className={`relative px-3.5 py-1 text-[11px] font-black tracking-tight shrink-0 flex items-center justify-center min-w-[54px] shadow-sm bg-gradient-to-r ${grad}`}
                    style={{
                      clipPath: 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)',
                      marginLeft: '-4px',
                    }}
                  >
                    {m.toFixed(2)}x
                  </div>
                );
              })}
            </div>
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
