import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RefreshCw, Trophy, Sparkles, Volume2, VolumeX, Flame, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameItem, UserProfile } from '../types.ts';

interface MahjongWinsGameModalProps {
  isOpen: boolean;
  game: GameItem | null;
  user: UserProfile | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenDeposit: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

export type SymbolType =
  | 'fa_green'
  | 'chuns_red'
  | 'bamboo'
  | 'circles'
  | 'numbers'
  | 'wild'
  | 'scatter';

interface SymbolDef {
  id: SymbolType;
  name: string;
  char: string;
  label: string;
  sub: string;
  color: string;
  bgGrad: string;
  borderCol: string;
  isSpecial?: boolean;
  pay: Record<number, number>;
}

const SYMBOL_DEFS: Record<SymbolType, SymbolDef> = {
  fa_green: {
    id: 'fa_green',
    name: 'Green Dragon (Fa)',
    char: '發',
    label: 'FA',
    sub: '龍',
    color: '#22c55e',
    bgGrad: 'from-emerald-900/80 to-stone-900',
    borderCol: 'border-emerald-500/70',
    pay: { 3: 15, 4: 40, 5: 100 }
  },
  chuns_red: {
    id: 'chuns_red',
    name: 'Red Dragon (Chun)',
    char: '中',
    label: 'CHUN',
    sub: '紅',
    color: '#ef4444',
    bgGrad: 'from-rose-950/80 to-stone-900',
    borderCol: 'border-rose-500/70',
    pay: { 3: 10, 4: 25, 5: 80 }
  },
  bamboo: {
    id: 'bamboo',
    name: '8 Bamboo',
    char: '🀐',
    label: '8 BAMBOO',
    sub: '條',
    color: '#10b981',
    bgGrad: 'from-green-950/80 to-stone-900',
    borderCol: 'border-green-500/50',
    pay: { 3: 8, 4: 20, 5: 40 }
  },
  circles: {
    id: 'circles',
    name: '5 Circles',
    char: '🀙',
    label: '5 DOTS',
    sub: '筒',
    color: '#0ea5e9',
    bgGrad: 'from-sky-950/80 to-stone-900',
    borderCol: 'border-sky-500/50',
    pay: { 3: 5, 4: 15, 5: 20 }
  },
  numbers: {
    id: 'numbers',
    name: '5 Wan',
    char: '🀇',
    label: '5 WAN',
    sub: '萬',
    color: '#f59e0b',
    bgGrad: 'from-amber-950/80 to-stone-900',
    borderCol: 'border-amber-500/50',
    pay: { 3: 3, 4: 8, 5: 10 }
  },
  wild: {
    id: 'wild',
    name: 'Golden Wild Ingot',
    char: '🀪',
    label: 'WILD',
    sub: '金',
    color: '#fbbf24',
    bgGrad: 'from-amber-500/40 via-yellow-600/30 to-stone-900',
    borderCol: 'border-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]',
    isSpecial: true,
    pay: { 3: 0, 4: 0, 5: 0 }
  },
  scatter: {
    id: 'scatter',
    name: 'Black Scatter Dragon',
    char: '🐉',
    label: 'SCATTER',
    sub: '黑龍',
    color: '#c084fc',
    bgGrad: 'from-purple-950 via-black to-purple-900',
    borderCol: 'border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.7)]',
    isSpecial: true,
    pay: { 3: 0, 4: 0, 5: 0 }
  }
};

const BET_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];
const MULTIPLIERS_BASE = [1, 2, 3, 5];
const MULTIPLIERS_FREE = [2, 4, 6, 10];

interface CellTile {
  symbol: SymbolType;
  isWinning?: boolean;
  isGold?: boolean;
  key: string;
}

export const MahjongWinsGameModal: React.FC<MahjongWinsGameModalProps> = ({
  isOpen,
  game,
  user,
  onClose,
  onOpenLogin,
  onOpenDeposit,
  onBalanceUpdate
}) => {
  const [bet, setBet] = useState(20000);
  const [grid, setGrid] = useState<CellTile[][]>(() => createInitialGrid());
  const [isSpinning, setIsSpinning] = useState(false);
  const [multiplierStep, setMultiplierStep] = useState(0);
  const [scattersCount, setScattersCount] = useState(0);
  const [isFreeSpin, setIsFreeSpin] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [roundTotalWin, setRoundTotalWin] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string>('PASANG TARUHANMU DAN RAIH BLACK SCATTER!');
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setGrid(createInitialGrid());
      setMultiplierStep(0);
      setScattersCount(0);
      setRoundTotalWin(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function getRandomSymbol(): SymbolType {
    const weights: Record<SymbolType, number> = {
      numbers: 28,
      circles: 24,
      bamboo: 20,
      chuns_red: 14,
      fa_green: 9,
      wild: 4,
      scatter: 3
    };
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (const [sym, w] of Object.entries(weights)) {
      if (rand < w) return sym as SymbolType;
      rand -= w;
    }
    return 'numbers';
  }

  function createInitialGrid(): CellTile[][] {
    return Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => ({
        symbol: getRandomSymbol(),
        isGold: c >= 1 && c <= 3 && Math.random() < 0.2,
        key: `cell-${r}-${c}-${Math.random()}`
      }))
    );
  }

  function evaluateWins(currentGrid: CellTile[][]) {
    const wins: { symbol: SymbolType; count: number; positions: [number, number][]; pay: number }[] = [];
    const checkable: SymbolType[] = ['fa_green', 'chuns_red', 'bamboo', 'circles', 'numbers'];

    for (const sym of checkable) {
      const matchPositions: [number, number][] = [];
      let consecutiveCols = 0;

      for (let c = 0; c < 5; c++) {
        const matchesInCol: [number, number][] = [];
        for (let r = 0; r < 5; r++) {
          const tile = currentGrid[r]?.[c];
          if (tile && (tile.symbol === sym || tile.symbol === 'wild')) {
            matchesInCol.push([r, c]);
          }
        }
        if (matchesInCol.length > 0) {
          consecutiveCols++;
          matchPositions.push(...matchesInCol);
        } else {
          break;
        }
      }

      if (consecutiveCols >= 3) {
        const payVal = SYMBOL_DEFS[sym].pay[consecutiveCols] || 0;
        const payout = payVal * (bet / 20);
        wins.push({ symbol: sym, count: consecutiveCols, positions: matchPositions, pay: payout });
      }
    }
    return wins;
  }

  const handleSpinClick = async () => {
    if (isSpinning) return;
    if (!user) {
      onOpenLogin();
      return;
    }
    if (user.balance < bet && !isFreeSpin) {
      setStatusMsg('Saldo Anda tidak mencukupi! Silakan deposit saldo.');
      return;
    }

    setIsSpinning(true);
    setStatusMsg('Memutar ubin...');
    setMultiplierStep(0);
    setRoundTotalWin(0);

    if (!isFreeSpin) {
      const newBal = user.balance - bet;
      onBalanceUpdate(newBal);
    } else {
      setFreeSpinsLeft((prev) => Math.max(0, prev - 1));
    }

    await new Promise((res) => setTimeout(res, turboMode ? 200 : 450));
    let workingGrid = createInitialGrid();
    setGrid(workingGrid);

    let currentStep = 0;
    let accumulatedWin = 0;
    let keepCascading = true;

    while (keepCascading) {
      const wins = evaluateWins(workingGrid);

      let scattersInGrid = 0;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (workingGrid[r][c].symbol === 'scatter') scattersInGrid++;
        }
      }
      setScattersCount(scattersInGrid);

      if (wins.length > 0) {
        const nextGrid = workingGrid.map((row, r) =>
          row.map((cell, c) => {
            const isWin = wins.some((w) => w.positions.some(([wr, wc]) => wr === r && wc === c));
            return { ...cell, isWinning: isWin };
          })
        );
        setGrid(nextGrid);

        const currentMult = isFreeSpin ? MULTIPLIERS_FREE[Math.min(currentStep, 3)] : MULTIPLIERS_BASE[Math.min(currentStep, 3)];
        const cascadeWin = wins.reduce((acc, w) => acc + w.pay, 0) * currentMult;
        accumulatedWin += cascadeWin;
        setRoundTotalWin(accumulatedWin);
        setStatusMsg(`KOMBO MENANG! +Rp ${cascadeWin.toLocaleString('id-ID')} (Pengali ${currentMult}x)`);

        await new Promise((res) => setTimeout(res, turboMode ? 350 : 600));

        const tumbledGrid: CellTile[][] = Array.from({ length: 5 }, () => Array(5).fill(null));

        for (let c = 0; c < 5; c++) {
          const survivingTiles: CellTile[] = [];
          for (let r = 4; r >= 0; r--) {
            const tile = nextGrid[r][c];
            if (!tile.isWinning) {
              survivingTiles.unshift({ ...tile, isWinning: false });
            } else if (tile.isGold) {
              survivingTiles.unshift({
                symbol: 'wild',
                isGold: false,
                isWinning: false,
                key: `wild-${r}-${c}-${Math.random()}`
              });
            }
          }

          const needed = 5 - survivingTiles.length;
          const newTiles: CellTile[] = Array.from({ length: needed }, (_, i) => ({
            symbol: getRandomSymbol(),
            isGold: c >= 1 && c <= 3 && Math.random() < 0.25,
            key: `drop-${i}-${c}-${Math.random()}`
          }));

          const fullCol = [...newTiles, ...survivingTiles];
          for (let r = 0; r < 5; r++) {
            tumbledGrid[r][c] = fullCol[r];
          }
        }

        workingGrid = tumbledGrid;
        setGrid(workingGrid);

        currentStep = Math.min(currentStep + 1, 3);
        setMultiplierStep(currentStep);

        await new Promise((res) => setTimeout(res, turboMode ? 250 : 450));
      } else {
        keepCascading = false;
      }
    }

    let finalScatters = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (workingGrid[r][c].symbol === 'scatter') finalScatters++;
      }
    }
    setScattersCount(finalScatters);

    if (finalScatters >= 3 && !isFreeSpin) {
      setIsFreeSpin(true);
      setFreeSpinsLeft(10);
      setStatusMsg('🎉 NAGA HITAM BANGKIT! 3 SCATTER TERCAPAI! 10 PUTARAN GRATIS DIAKTIFKAN!');
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    } else if (accumulatedWin > 0) {
      setStatusMsg(`SELAMAT! Total Kemenangan Ronde Ini: Rp ${accumulatedWin.toLocaleString('id-ID')}`);
      if (accumulatedWin > bet * 3) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      if (user) {
        const updatedBal = (user.balance - (isFreeSpin ? 0 : bet)) + accumulatedWin;
        onBalanceUpdate(updatedBal);
      }
    } else {
      setStatusMsg('Coba lagi! Dapatkan 3 atau lebih ubin sejenis berurutan.');
    }

    setIsSpinning(false);

    if (isFreeSpin && freeSpinsLeft <= 1) {
      setIsFreeSpin(false);
      setStatusMsg('Putaran Gratis Selesai! Hadiah telah ditambahkan ke saldo Anda.');
    }
  };

  const activeMultipliers = isFreeSpin ? MULTIPLIERS_FREE : MULTIPLIERS_BASE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c1106] via-[#120a04] to-[#0a0502] border-2 border-amber-500/60 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] p-3 sm:p-5 flex flex-col my-auto max-h-[96vh] overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* --- HEADER --- */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-900 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center">
              <img
                src="/games/mahjong_wins_3.png"
                alt="Mahjong Wins 3"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-2xl">🐉</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wider">
                  MAHJONG WINS 3
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black bg-gradient-to-r from-purple-900 to-black text-purple-300 border border-purple-500/60 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                  BLACK SCATTER
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-300/80">
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  PRAGMATIC PLAY
                </span>
                <span>• RTP Live: <strong className="text-emerald-400">97.9%</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-stone-900/80 text-amber-400 hover:bg-stone-800 border border-amber-500/30 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/80 text-stone-400 hover:text-white hover:bg-rose-950/80 border border-stone-800 hover:border-rose-500/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- TOP HUD: SCATTER TRACKER & MULTIPLIER BAR --- */}
        <div className="relative z-10 grid grid-cols-12 gap-2 my-3">
          {/* Left Scatter Vault */}
          <div className="col-span-5 bg-gradient-to-r from-purple-950/80 via-black to-stone-950 border border-purple-500/50 rounded-2xl p-2 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-400/60 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse">
                🐉
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                  {scattersCount}/3 KEPINGAN
                </div>
                <div className="w-20 sm:w-28 bg-stone-900 rounded-full h-2 border border-purple-500/30 overflow-hidden mt-0.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (scattersCount / 3) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
              2d
            </span>
          </div>

          {/* Right Multiplier Steps Bar */}
          <div className="col-span-7 bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-500/50 rounded-2xl p-1.5 flex items-center justify-around shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            {activeMultipliers.map((mult, idx) => {
              const isActive = multiplierStep === idx;
              const isPast = multiplierStep >= idx;
              return (
                <div
                  key={mult}
                  className={`flex-1 mx-1 py-1 px-1 rounded-xl text-center font-black text-xs sm:text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-t from-amber-500 via-yellow-400 to-amber-300 text-stone-950 shadow-[0_0_20px_rgba(251,191,36,0.9)] scale-105 border border-yellow-200 animate-bounce'
                      : isPast
                      ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                      : 'bg-stone-900/60 text-stone-500 border border-stone-800'
                  }`}
                >
                  <span className="flex items-center justify-center gap-0.5">
                    {isActive && <Flame className="w-3 h-3 text-red-600 animate-pulse inline" />}
                    x{mult}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Free Spins Alert Banner */}
        {isFreeSpin && (
          <div className="relative z-10 mb-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-900 via-rose-900 to-amber-900 border border-amber-400 text-center font-black text-xs text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            MODE PUTARAN GRATIS AKTIF! TERSISA: {freeSpinsLeft} PUTARAN (PENGALI GANDA SAMPAI x10)
          </div>
        )}

        {/* --- 5x5 CASCADING MAHJONG GRID --- */}
        <div className="relative z-10 bg-gradient-to-b from-stone-950 via-[#180e06] to-black border-2 border-amber-600/60 rounded-2xl p-2 sm:p-3 shadow-inner shadow-black/80">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const def = SYMBOL_DEFS[cell.symbol];
                const isWinning = cell.isWinning;
                const isGold = cell.isGold;

                return (
                  <div
                    key={cell.key || `${rIdx}-${cIdx}`}
                    className={`relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                      isWinning
                        ? 'scale-110 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 shadow-[0_0_25px_rgba(251,191,36,1)] border-2 border-white z-20 animate-pulse'
                        : isGold
                        ? 'bg-gradient-to-br from-amber-400/30 via-yellow-600/20 to-stone-900 border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                        : `bg-gradient-to-b ${def.bgGrad} border ${def.borderCol}`
                    }`}
                  >
                    {/* Corner Tag */}
                    <span className="absolute top-1 left-1.5 text-[8px] sm:text-[10px] font-black text-stone-400/80">
                      {def.sub}
                    </span>

                    {/* Main Character */}
                    <span
                      className={`text-2xl sm:text-4xl font-black leading-none drop-shadow-md select-none transition-transform ${
                        isWinning ? 'text-stone-950 scale-125' : ''
                      }`}
                      style={{ color: isWinning ? '#000000' : def.color }}
                    >
                      {def.char}
                    </span>

                    {/* Bottom Label */}
                    <span
                      className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter mt-0.5 select-none ${
                        isWinning ? 'text-stone-900' : 'text-stone-300/80'
                      }`}
                    >
                      {def.label}
                    </span>

                    {/* Gold indicator */}
                    {isGold && !isWinning && (
                      <span className="absolute top-1 right-1 text-[8px] font-black text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-500/50">
                        GOLD
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- STATUS MESSAGE --- */}
        <div className="relative z-10 text-center py-2">
          <p className="text-xs sm:text-sm font-bold text-amber-300/90 tracking-wide drop-shadow truncate">
            {statusMsg}
          </p>
        </div>

        {/* --- CONTROL DOCK: TARUHAN, SALDO & SPIN BUTTON --- */}
        <div className="relative z-10 bg-stone-950/90 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 mt-auto">
          {/* Row 1: Saldo & Quick Bets */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-stone-300">
              Saldo:{' '}
              <strong className="text-amber-400 text-sm">
                Rp {user ? user.balance.toLocaleString('id-ID') : '0'}
              </strong>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto max-w-[65%] py-0.5">
              {BET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => setBet(amt)}
                  className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                    bet === amt
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-yellow-200'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}rb` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Action Controls */}
          <div className="grid grid-cols-12 gap-2">
            {/* Turbo & Auto Spin */}
            <div className="col-span-4 flex items-center gap-1.5">
              <button
                disabled={isSpinning}
                onClick={() => setTurboMode(!turboMode)}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border transition-all ${
                  turboMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                TURBO
              </button>

              <button
                disabled={isSpinning}
                onClick={() => {
                  if (autoSpinCount > 0) {
                    setAutoSpinCount(0);
                  } else {
                    setAutoSpinCount(20);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border transition-all ${
                  autoSpinCount > 0
                    ? 'bg-purple-900/40 text-purple-300 border-purple-500/60'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {autoSpinCount > 0 ? `${autoSpinCount}` : 'AUTO'}
              </button>
            </div>

            {/* Main Spin Button */}
            <div className="col-span-8">
              {!user ? (
                <button
                  onClick={onOpenLogin}
                  className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-stone-950" />
                  LOGIN UNTUK MEMUTAR
                </button>
              ) : (
                <button
                  disabled={isSpinning}
                  onClick={handleSpinClick}
                  className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSpinning
                      ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:brightness-110 active:scale-95 border border-yellow-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 fill-stone-950" />
                  {isSpinning ? 'MEMUTAR...' : 'PASANG TARUHANMU! (SPIN)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
