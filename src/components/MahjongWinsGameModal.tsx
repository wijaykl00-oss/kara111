import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RefreshCw, Minus, Plus, Info, Volume2 } from 'lucide-react';
import { GameItem, UserProfile } from '../types.ts';

interface Props {
  isOpen: boolean;
  game: GameItem | null;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenDeposit: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

// ─── Symbol definitions ────────────────────────────────────────────────────────
type Sym = 'fa' | 'chun' | 'bam8' | 'circ5' | 'wan8' | 'wan5' | 'wild' | 'scatter';

interface SymDef {
  bg: string;        // tile background colour
  border: string;
  mainColor: string;
  topLeft: string;   // small corner label
  mainChar: string;  // big centre character / strokes
  mainIsText: boolean;
  label: string;
  pay: Record<number, number>;
  isSpecial?: boolean;
}

const SYMS: Record<Sym, SymDef> = {
  fa: {
    bg: '#f5f0e8', border: '#d4c9a0', mainColor: '#1a7a2a',
    topLeft: '發', mainChar: '發', mainIsText: true,
    label: 'FA', pay: { 3: 15, 4: 40, 5: 100 }
  },
  chun: {
    bg: '#f5f0e8', border: '#d4c9a0', mainColor: '#cc2222',
    topLeft: '中', mainChar: '中', mainIsText: true,
    label: 'CHUN', pay: { 3: 10, 4: 25, 5: 80 }
  },
  bam8: {
    bg: '#f5f0e8', border: '#d4c9a0', mainColor: '#228844',
    topLeft: '八\n條', mainChar: 'BAM8', mainIsText: false,
    label: '8 BAM', pay: { 3: 8, 4: 20, 5: 40 }
  },
  circ5: {
    bg: '#f5f0e8', border: '#d4c9a0', mainColor: '#2266bb',
    topLeft: '五\n筒', mainChar: 'CIRC5', mainIsText: false,
    label: '5 DOT', pay: { 3: 5, 4: 15, 5: 20 }
  },
  wan8: {
    bg: '#f5f0e8', border: '#d4c9a0', mainColor: '#993311',
    topLeft: '八\n萬', mainChar: '八萬', mainIsText: true,
    label: '8 WAN', pay: { 3: 4, 4: 12, 5: 25 }
  },
  wan5: {
    bg: '#f5f0e8', border: '#d4c9a0', mainColor: '#884422',
    topLeft: '五\n萬', mainChar: '五萬', mainIsText: true,
    label: '5 WAN', pay: { 3: 3, 4: 8, 5: 15 }
  },
  wild: {
    bg: '#ffe066', border: '#e6b800', mainColor: '#7a4500',
    topLeft: '旺', mainChar: '旺', mainIsText: true,
    label: 'WILD', pay: { 3: 0, 4: 0, 5: 0 }, isSpecial: true
  },
  scatter: {
    bg: '#1a0a2e', border: '#7c3aed', mainColor: '#c084fc',
    topLeft: '黑\n龍', mainChar: '🐉', mainIsText: true,
    label: 'SCATTER', pay: { 3: 0, 4: 0, 5: 0 }, isSpecial: true
  },
};

const BET_OPTIONS = [20, 40, 80, 200, 400, 1000];
const MULTS = [1, 2, 3, 5];
const AUTO_OPTIONS = [10, 20, 50, 100];

interface Cell { sym: Sym; key: string; winning?: boolean; gold?: boolean; spinning?: boolean; }

function randSym(): Sym {
  const w: [Sym, number][] = [
    ['fa', 9], ['chun', 10], ['bam8', 16], ['circ5', 18],
    ['wan8', 18], ['wan5', 20], ['wild', 5], ['scatter', 4],
  ];
  const total = w.reduce((a, [, n]) => a + n, 0);
  let r = Math.random() * total;
  for (const [sym, n] of w) { if (r < n) return sym; r -= n; }
  return 'wan5';
}

function mkGrid(): Cell[][] {
  return Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => ({
      sym: randSym(), key: `${r}${c}${Math.random()}`, gold: Math.random() < 0.12
    }))
  );
}

// ─── Tile Renderer ─────────────────────────────────────────────────────────────
const BambooStripes: React.FC<{ color: string; count: number }> = ({ color, count }) => (
  <div className="flex flex-col items-center justify-center gap-0.5 w-full h-full py-1">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="w-3/4 rounded-full" style={{ height: 3, background: color }} />
    ))}
  </div>
);

const DotPattern: React.FC<{ color: string; count: number }> = ({ color, count }) => {
  const positions: [number, number][][] = [
    [], [[50, 50]], [[30, 50], [70, 50]],
    [[30, 25], [70, 50], [30, 75]],
    [[30, 25], [70, 25], [30, 75], [70, 75]],
    [[30, 20], [70, 20], [50, 50], [30, 80], [70, 80]],
  ];
  const pts = positions[Math.min(count, 5)];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full p-1">
      {pts.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={11} fill={color} />
      ))}
    </svg>
  );
};

const Tile: React.FC<{ cell: Cell; size?: 'sm' | 'md' }> = ({ cell, size = 'md' }) => {
  const def = SYMS[cell.sym];
  const isScatter = cell.sym === 'scatter';
  const isWild = cell.sym === 'wild';
  const isWinning = cell.winning;
  const s = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div
      className={`relative w-full h-full rounded-lg flex flex-col overflow-hidden select-none
        transition-all duration-200
        ${isWinning ? 'scale-105 ring-2 ring-yellow-300 shadow-[0_0_18px_rgba(251,191,36,0.9)] z-10' : ''}
        ${cell.spinning ? 'opacity-60 translate-y-1' : ''}
      `}
      style={{
        background: isScatter
          ? 'linear-gradient(135deg,#1a0a2e,#3b0764,#1a0a2e)'
          : isWild
          ? 'linear-gradient(135deg,#ffe066,#ffd000,#ffb300)'
          : `linear-gradient(160deg,#fffef5 60%,#f0e8cc)`,
        border: `2px solid ${isWinning ? '#fde047' : def.border}`,
        boxShadow: isWinning
          ? '0 0 20px rgba(253,224,71,0.8), inset 0 0 8px rgba(253,224,71,0.3)'
          : isScatter
          ? '0 0 12px rgba(124,58,237,0.6)'
          : '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      {/* Top-left corner */}
      <div className={`absolute top-0.5 left-1 leading-none ${s} font-black whitespace-pre-line`}
        style={{ color: def.mainColor, fontSize: '0.55rem' }}>
        {def.topLeft}
      </div>

      {/* Gold badge */}
      {cell.gold && !isWinning && !isScatter && (
        <div className="absolute top-0.5 right-0.5 text-[7px] font-black text-amber-700 bg-yellow-300 px-0.5 rounded"
          style={{ fontSize: '0.45rem' }}>GOLD</div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        {cell.sym === 'bam8' ? (
          <BambooStripes color={def.mainColor} count={8} />
        ) : cell.sym === 'circ5' ? (
          <DotPattern color={def.mainColor} count={5} />
        ) : (
          <span
            className={`font-black leading-none drop-shadow-sm ${
              isScatter ? 'text-2xl' : 'text-xl sm:text-2xl'
            }`}
            style={{ color: isWild ? '#7a4500' : def.mainColor }}
          >
            {def.mainChar}
          </span>
        )}
      </div>

      {/* Bottom label */}
      <div className="text-center pb-0.5"
        style={{ fontSize: '0.42rem', color: isScatter ? '#a78bfa' : isWild ? '#7a4500' : '#666', fontWeight: 900, letterSpacing: '0.05em' }}>
        {def.label}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const MahjongWinsGameModal: React.FC<Props> = ({
  isOpen, game, user, onClose, onOpenLogin, onOpenDeposit, onBalanceUpdate
}) => {
  const [bet, setBet] = useState(40);
  const [credit, setCredit] = useState(user?.balance ?? 0);
  const [grid, setGrid] = useState<Cell[][]>(mkGrid);
  const [spinning, setSpinning] = useState(false);
  const [multStep, setMultStep] = useState(0);
  const [scatters, setScatters] = useState(0);
  const [freeSpin, setFreeSpin] = useState(false);
  const [freeLeft, setFreeLeft] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [statusMsg, setStatusMsg] = useState('TAHAN SPASI UNTUK SPIN TURBO');
  const [autoCount, setAutoCount] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [showAutoMenu, setShowAutoMenu] = useState(false);
  const autoRef = useRef(autoCount);
  autoRef.current = autoCount;
  const spinningRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setCredit(user?.balance ?? 0);
      setGrid(mkGrid());
      setMultStep(0);
      setScatters(0);
      setTotalWin(0);
    }
  }, [isOpen, user]);

  // Spacebar support
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setTurbo(true);
        doSpin();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setTurbo(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, [isOpen, spinning]);

  function countScatters(g: Cell[][]): number {
    let n = 0;
    g.forEach(row => row.forEach(c => { if (c.sym === 'scatter') n++; }));
    return n;
  }

  function evalWins(g: Cell[][]): { sym: Sym; cols: number; pos: [number, number][]; base: number }[] {
    const results: { sym: Sym; cols: number; pos: [number, number][]; base: number }[] = [];
    const checkable: Sym[] = ['fa', 'chun', 'bam8', 'circ5', 'wan8', 'wan5'];
    for (const sym of checkable) {
      const pos: [number, number][] = [];
      let cols = 0;
      for (let c = 0; c < 5; c++) {
        const hits: [number, number][] = [];
        for (let r = 0; r < 5; r++) {
          const cell = g[r][c];
          if (cell.sym === sym || cell.sym === 'wild') hits.push([r, c]);
        }
        if (hits.length > 0) { cols++; pos.push(...hits); } else break;
      }
      if (cols >= 3) {
        const base = (SYMS[sym].pay[cols] ?? 0) * (bet / 20);
        results.push({ sym, cols, pos, base });
      }
    }
    return results;
  }

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const doSpin = useCallback(async () => {
    if (spinningRef.current) return;
    if (!user) { onOpenLogin(); return; }
    if (credit < bet && !freeSpin) {
      setStatusMsg('SALDO TIDAK CUKUP! SILAKAN DEPOSIT.');
      return;
    }

    spinningRef.current = true;
    setSpinning(true);
    setMultStep(0);
    setTotalWin(0);

    // Deduct bet
    let newCredit = credit;
    if (!freeSpin) {
      newCredit = credit - bet;
      setCredit(newCredit);
      onBalanceUpdate(newCredit);
    } else {
      setFreeLeft(p => Math.max(0, p - 1));
    }

    // Spinning animation frames
    setStatusMsg('MEMUTAR UBIN...');
    const spinFrames = turbo ? 2 : 5;
    for (let i = 0; i < spinFrames; i++) {
      setGrid(prev => prev.map((row, r) => row.map((cell, c) => ({
        ...cell, sym: randSym(), key: `sp${r}${c}${i}${Math.random()}`, spinning: true
      }))));
      await delay(turbo ? 60 : 80);
    }

    // Final grid
    let workGrid = mkGrid();
    workGrid = workGrid.map((row, r) => row.map((cell, c) => ({ ...cell, spinning: false, key: `f${r}${c}${Math.random()}` })));
    setGrid(workGrid);

    const sc = countScatters(workGrid);
    setScatters(sc);

    await delay(turbo ? 150 : 300);

    // Cascade loop
    let step = 0;
    let accumulated = 0;
    let keepGoing = true;

    while (keepGoing) {
      const wins = evalWins(workGrid);
      if (wins.length === 0) { keepGoing = false; break; }

      // Mark winning tiles
      const winPos = new Set(wins.flatMap(w => w.pos.map(([r, c]) => `${r},${c}`)));
      setGrid(workGrid.map((row, r) => row.map((cell, c) => ({
        ...cell, winning: winPos.has(`${r},${c}`)
      }))));

      const mult = MULTS[Math.min(step, 3)];
      const stepWin = wins.reduce((a, w) => a + w.base, 0) * mult;
      accumulated += stepWin;
      setMultStep(Math.min(step, 3));
      setTotalWin(accumulated);
      setStatusMsg(`KOMBO! +Rp ${stepWin.toLocaleString('id-ID')} × ${mult}`);

      await delay(turbo ? 300 : 600);

      // Cascade down
      const newGrid: Cell[][] = Array.from({ length: 5 }, () => Array(5).fill(null as any));
      for (let c = 0; c < 5; c++) {
        const survivors: Cell[] = [];
        for (let r = 4; r >= 0; r--) {
          const cell = workGrid[r][c];
          if (!winPos.has(`${r},${c}`)) {
            survivors.unshift({ ...cell, winning: false });
          } else if (cell.gold) {
            survivors.unshift({ sym: 'wild', key: `w${r}${c}${Math.random()}`, gold: false, winning: false });
          }
        }
        const needed = 5 - survivors.length;
        const newTiles: Cell[] = Array.from({ length: needed }, (_, i) => ({
          sym: randSym(), key: `n${i}${c}${Math.random()}`, gold: Math.random() < 0.12
        }));
        const col = [...newTiles, ...survivors];
        for (let r = 0; r < 5; r++) newGrid[r][c] = col[r];
      }

      workGrid = newGrid;
      setGrid(workGrid);
      step++;
      await delay(turbo ? 150 : 300);
    }

    // Final scatter check
    const finalSc = countScatters(workGrid);
    setScatters(finalSc);

    if (finalSc >= 3 && !freeSpin) {
      setFreeSpin(true);
      setFreeLeft(10);
      setStatusMsg('🎉 NAGA HITAM BANGKIT! 10 PUTARAN GRATIS!');
    } else if (accumulated > 0) {
      const finalBal = newCredit + accumulated;
      setCredit(finalBal);
      onBalanceUpdate(finalBal);
      setStatusMsg(`MENANG Rp ${accumulated.toLocaleString('id-ID')}! Total kemenangan ronde ini.`);
    } else {
      setStatusMsg('TAHAN SPASI UNTUK SPIN TURBO');
    }

    if (freeSpin && freeLeft <= 1) {
      setFreeSpin(false);
      setStatusMsg('PUTARAN GRATIS SELESAI!');
    }

    spinningRef.current = false;
    setSpinning(false);
  }, [spinning, user, credit, bet, freeSpin, freeLeft, turbo, onBalanceUpdate, onOpenLogin]);

  // Auto spin loop
  useEffect(() => {
    if (autoRunning && autoCount > 0 && !spinningRef.current) {
      const t = setTimeout(() => {
        doSpin().then(() => {
          setAutoCount(p => {
            const next = p - 1;
            if (next <= 0) setAutoRunning(false);
            return next;
          });
        });
      }, 400);
      return () => clearTimeout(t);
    }
    if (autoCount <= 0) setAutoRunning(false);
  }, [autoRunning, autoCount, spinning]);

  if (!isOpen) return null;

  const betIdx = BET_OPTIONS.indexOf(bet);
  const decreaseBet = () => { if (betIdx > 0) setBet(BET_OPTIONS[betIdx - 1]); };
  const increaseBet = () => { if (betIdx < BET_OPTIONS.length - 1) setBet(BET_OPTIONS[betIdx + 1]); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 select-none overflow-hidden"
      style={{ fontFamily: "'Noto Sans', sans-serif" }}>

      {/* Outer wrapper – full game viewport */}
      <div className="relative w-full h-full max-w-2xl mx-auto flex flex-col overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, #ff8fa0 0%, #e85a7a 35%, #c0254a 70%, #7a0022 100%)',
          maxHeight: '100dvh',
        }}>

        {/* ══ CLOSE BUTTON ══ */}
        <button onClick={onClose}
          className="absolute top-2 right-2 z-50 w-8 h-8 rounded-full bg-stone-900/80 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700 shadow-lg cursor-pointer transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* ══ TOP BAR: MULTIPLIER + SCATTER PANEL ══ */}
        <div className="flex items-start gap-2 px-2 pt-2 pb-1 shrink-0">

          {/* Scatter panel – left */}
          <div className="flex flex-col items-center gap-1 bg-black/40 border border-purple-500/60 rounded-xl p-2 min-w-[72px] shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <div className="w-10 h-10 rounded-full bg-purple-900/80 border-2 border-purple-400 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(168,85,247,0.6)] animate-pulse">
              🐉
            </div>
            <div className="text-[10px] font-black text-purple-300 text-center leading-tight">
              {scatters}/3<br />KEPINGAN
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-black/60 rounded-full border border-purple-800 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (scatters / 3) * 100)}%`, background: 'linear-gradient(90deg,#7c3aed,#ec4899,#fbbf24)' }} />
            </div>
            <div className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">2d</div>
          </div>

          {/* Multiplier bar – center stretching right */}
          <div className="flex-1">
            <div className="rounded-xl border-2 border-amber-500 bg-gradient-to-b from-amber-900 via-[#3a1800] to-amber-950 p-1 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <div className="grid grid-cols-4 gap-1">
                {MULTS.map((m, i) => {
                  const isActive = multStep === i && spinning;
                  const isPast = multStep > i;
                  return (
                    <div key={m} className={`relative py-1.5 rounded-lg text-center font-black text-base transition-all duration-300
                      ${isActive ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 text-stone-950 shadow-[0_0_20px_rgba(251,191,36,1)] scale-105 border border-yellow-200' : ''}
                      ${isPast && !isActive ? 'bg-amber-700/60 text-amber-200 border border-amber-500/40' : ''}
                      ${!isActive && !isPast ? 'bg-black/40 text-amber-400/60 border border-amber-900/40' : ''}
                    `}>
                      <span className="text-sm sm:text-lg">x{m}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logo top-right */}
            <div className="flex justify-end mt-1">
              <div className="text-right">
                <div className="font-black text-transparent bg-clip-text leading-none"
                  style={{ fontSize: '1.05rem', background: 'linear-gradient(135deg,#fbbf24,#22c55e,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  MAHJONG<br />WINS <span style={{ color: '#f59e0b', WebkitTextFillColor: '#f59e0b' }}>3</span>
                </div>
                <div className="text-[9px] font-black text-purple-300 border border-purple-600 px-1 rounded bg-black/50 inline-block">BLACK SCATTER</div>
              </div>
            </div>
          </div>
        </div>

        {/* Free Spin banner */}
        {freeSpin && (
          <div className="mx-2 mb-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-900 via-rose-900 to-amber-900 border border-amber-400 text-center font-black text-xs text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse shrink-0">
            ✨ PUTARAN GRATIS AKTIF! TERSISA {freeLeft} × PENGALI GANDA
          </div>
        )}

        {/* ══ 5×5 GRID ══ */}
        <div className="flex-1 px-2 py-1 flex items-center justify-center min-h-0">
          {/* Grid frame – golden arch border */}
          <div className="w-full aspect-square max-h-full rounded-2xl p-2"
            style={{
              background: 'linear-gradient(160deg,rgba(255,215,0,0.15),rgba(180,100,0,0.08))',
              border: '3px solid rgba(218,165,32,0.7)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 0 30px rgba(218,165,32,0.2)',
            }}>
            <div className="grid grid-cols-5 gap-1 h-full w-full"
              style={{ gridTemplateRows: 'repeat(5,1fr)' }}>
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <Tile key={cell.key || `${r}-${c}`} cell={cell} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ══ BOTTOM CONTROL DOCK ══ */}
        <div className="shrink-0 mx-2 mb-2 rounded-2xl overflow-hidden border border-amber-500/40 shadow-[0_0_20px_rgba(0,0,0,0.6)]"
          style={{ background: 'linear-gradient(180deg,#3a1800 0%,#1a0a00 100%)' }}>

          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-amber-900/40"
            style={{ background: 'linear-gradient(90deg,#7a0022,#3a0014,#7a0022)' }}>
            <div className="flex items-center gap-2 text-xs font-black text-white tracking-wide">
              {spinning ? (
                <span className="animate-pulse">⟳ MEMUTAR...</span>
              ) : totalWin > 0 ? (
                <span className="text-amber-300">🏆 MENANG Rp {totalWin.toLocaleString('id-ID')}</span>
              ) : (
                statusMsg
              )}
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
          </div>

          {/* Credit / Bet display */}
          <div className="grid grid-cols-2 border-b border-amber-900/40">
            <div className="px-3 py-1.5 border-r border-amber-900/40">
              <div className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">KREDIT</div>
              <div className="text-base font-black text-amber-300 font-mono">
                {user ? Math.floor(credit / bet) : 0}
              </div>
            </div>
            <div className="px-3 py-1.5">
              <div className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">TARUHAN</div>
              <div className="text-base font-black text-amber-300 font-mono">{bet}</div>
            </div>
          </div>

          {/* Main controls row */}
          <div className="flex items-center gap-2 px-2 py-2">
            {/* Info / settings */}
            <button className="w-9 h-9 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer shrink-0">
              <Info className="w-4 h-4" />
            </button>

            {/* Bet minus */}
            <button
              disabled={spinning || betIdx <= 0}
              onClick={decreaseBet}
              className="w-9 h-9 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center text-amber-400 hover:bg-stone-800 disabled:opacity-40 cursor-pointer shrink-0 transition-colors">
              <Minus className="w-4 h-4" />
            </button>

            {/* Main SPIN button */}
            <button
              disabled={spinning}
              onClick={() => doSpin()}
              className="flex-1 h-14 rounded-2xl font-black text-stone-950 text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              style={{
                background: spinning
                  ? 'linear-gradient(135deg,#555,#333)'
                  : 'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)',
                boxShadow: spinning ? 'none' : '0 0 25px rgba(251,191,36,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}>
              {spinning ? (
                <RefreshCw className="w-6 h-6 text-stone-400 animate-spin" />
              ) : (
                <RefreshCw className="w-6 h-6" />
              )}
            </button>

            {/* Bet plus */}
            <button
              disabled={spinning || betIdx >= BET_OPTIONS.length - 1}
              onClick={increaseBet}
              className="w-9 h-9 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center text-amber-400 hover:bg-stone-800 disabled:opacity-40 cursor-pointer shrink-0 transition-colors">
              <Plus className="w-4 h-4" />
            </button>

            {/* AUTO SPIN button */}
            <div className="relative shrink-0">
              <button
                disabled={spinning}
                onClick={() => {
                  if (autoRunning) {
                    setAutoRunning(false);
                    setAutoCount(0);
                    setShowAutoMenu(false);
                  } else {
                    setShowAutoMenu(p => !p);
                  }
                }}
                className={`px-3 h-9 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition-all ${
                  autoRunning
                    ? 'bg-red-900/60 text-red-300 border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    : 'bg-amber-950/80 text-amber-300 border-amber-700 hover:bg-amber-900'
                }`}>
                <RefreshCw className={`w-3 h-3 ${autoRunning ? 'animate-spin' : ''}`} />
                {autoRunning ? `STOP (${autoCount})` : 'MAIN\nOTOMATIS'}
              </button>
              {showAutoMenu && !autoRunning && (
                <div className="absolute bottom-full right-0 mb-1 bg-stone-900 border border-amber-700 rounded-xl shadow-xl overflow-hidden z-50">
                  {AUTO_OPTIONS.map(n => (
                    <button key={n}
                      onClick={() => { setAutoCount(n); setAutoRunning(true); setShowAutoMenu(false); }}
                      className="block w-full px-4 py-2 text-xs font-black text-amber-300 hover:bg-amber-900/40 text-left cursor-pointer">
                      {n}×
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pragmatic footer */}
          <div className="text-center text-[9px] text-stone-600 pb-1 font-mono tracking-wider">
            PRAGMATIC PLAY • #10513441219865173
          </div>
        </div>
      </div>
    </div>
  );
};
