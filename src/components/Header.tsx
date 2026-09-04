import React, { useState } from 'react';
import {
  MessageSquare,
  Instagram,
  Facebook,
  Send,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  LogOut,
  RefreshCw,
  Crown,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface HeaderProps {
  user: UserProfile | null;
  onLogin: (username: string, pass: string) => Promise<boolean>;
  onOpenRegister: () => void;
  onOpenForgotPass: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenHistory: () => void;
  onOpenLiveChat: () => void;
  onLogout: () => void;
  onRefreshBalance: () => void;
  isRefreshingBalance?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onOpenRegister,
  onOpenForgotPass,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenHistory,
  onOpenLiveChat,
  onLogout,
  onRefreshBalance,
  isRefreshingBalance = false
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Username dan kata sandi harus diisi');
      return;
    }
    setErrorMessage('');
    setLoginLoading(true);
    const success = await onLogin(username, password);
    setLoginLoading(false);
    if (!success) {
      setErrorMessage('Username atau kata sandi salah');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <header className="w-full max-w-4xl mx-auto px-3 pt-3 pb-2 select-none">
      {/* Top Logo: Golden Crown, Chinese Coin Talisman, and KARA111 */}
      <div className="flex justify-center items-center py-2 relative">
        <a href="/" className="group flex flex-col items-center cursor-pointer transition-transform duration-200 active:scale-95">
          <div className="flex items-center gap-2">
            {/* Talisman & Gold Coins Icon Badge */}
            <div className="relative flex items-center justify-center">
              <div className="w-11 h-14 bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-600 rounded-sm shadow-lg border border-amber-200 flex flex-col items-center justify-between p-1">
                <Crown className="w-5 h-5 text-red-700 drop-shadow animate-pulse" />
                <span className="text-[9px] font-black tracking-widest text-red-900 writing-vertical uppercase">發財</span>
                <div className="flex -space-x-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-300 border border-amber-600 shadow-sm flex items-center justify-center text-[7px] font-bold text-amber-900">¥</div>
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-amber-600 shadow-sm flex items-center justify-center text-[7px] font-bold text-amber-900">¥</div>
                </div>
              </div>
            </div>

            {/* Brand Text: KARA111 */}
            <div className="flex flex-col items-start leading-none">
              <div className="flex items-baseline">
                <span className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-amber-100 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] font-['Chakra_Petch']">
                  KARA<span className="text-amber-400 text-3xl md:text-4xl font-extrabold tracking-normal">111</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-[2px] w-6 bg-gradient-to-r from-amber-400 to-transparent"></span>
                <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400/90 uppercase">
                  Official Gaming Portal
                </span>
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* Main Top Two-Column Grid: Social Buttons (Left) & Mulai Bermain Form / Member Profile (Right) */}
      <div className="grid grid-cols-12 gap-3 mt-3 items-stretch">
        {/* Left Column: Social Links Stack */}
        <div className="col-span-4 sm:col-span-3 flex flex-col justify-between gap-1.5">
          {/* Live Chat */}
          <button
            onClick={onOpenLiveChat}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#271d15] hover:bg-[#382a1d] text-amber-100/90 border border-amber-900/40 hover:border-amber-500/50 shadow-sm transition-all duration-150 text-left group"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:text-amber-300">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Live Chat</span>
          </button>

          {/* WhatsApp */}
          <a
            href="https://wa.me/?text=Halo%20KARA111%20Saya%20Mau%20Daftar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#271d15] hover:bg-[#382a1d] text-amber-100/90 border border-amber-900/40 hover:border-green-500/50 shadow-sm transition-all duration-150 text-left group"
          >
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:text-green-300">
              <span className="text-xs font-bold">WA</span>
            </div>
            <span className="text-xs font-semibold tracking-wide">WhatsApp</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#271d15] hover:bg-[#382a1d] text-amber-100/90 border border-amber-900/40 hover:border-pink-500/50 shadow-sm transition-all duration-150 text-left group"
          >
            <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:text-pink-300">
              <Instagram className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Instagram</span>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#271d15] hover:bg-[#382a1d] text-amber-100/90 border border-amber-900/40 hover:border-blue-500/50 shadow-sm transition-all duration-150 text-left group"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300">
              <Facebook className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Facebook</span>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#271d15] hover:bg-[#382a1d] text-amber-100/90 border border-amber-900/40 hover:border-sky-500/50 shadow-sm transition-all duration-150 text-left group"
          >
            <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:text-sky-300">
              <Send className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Telegram</span>
          </a>
        </div>

        {/* Right Column: Mulai Bermain Login Form OR Logged In Member Dashboard */}
        <div className="col-span-8 sm:col-span-9 bg-[#19120c] p-3 sm:p-4 rounded-xl border border-amber-950/60 shadow-xl flex flex-col justify-center">
          {!user ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-extrabold text-amber-50 tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Mulai Bermain
                </h2>
                <span className="text-[10px] text-amber-400/80 font-medium">KARA111 VIP Server</span>
              </div>

              {errorMessage && (
                <div className="px-2.5 py-1 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Username Input */}
              <div className="relative flex items-center">
                <div className="absolute left-3 text-amber-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#2a1e14] border border-amber-900/50 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="relative flex items-center">
                <div className="absolute left-3 text-amber-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#2a1e14] border border-amber-900/50 rounded-lg pl-9 pr-9 py-2 text-xs sm:text-sm text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-amber-400 hover:text-amber-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onOpenForgotPass}
                  className="text-[11px] text-amber-300/80 hover:text-amber-200 hover:underline cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>

              {/* Action Buttons: MASUK & DAFTAR */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2 px-3 rounded-lg bg-[#3a2717] hover:bg-[#4d3521] text-amber-100 font-extrabold text-xs sm:text-sm tracking-wider border border-amber-800/60 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loginLoading ? 'MEMUAT...' : 'MASUK'}
                </button>

                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                >
                  DAFTAR
                </button>
              </div>
            </form>
          ) : (
            /* Logged In Member Profile Card */
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-stone-950 font-black text-sm shadow">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm sm:text-base text-amber-50">{user.username}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {user.vipLevel}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-400/70">{user.bankName} - {user.accountNumber || 'Aktif'}</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-[11px] text-amber-400/80 hover:text-red-400 px-2 py-1 rounded bg-amber-950/30 hover:bg-red-950/40 border border-amber-900/30 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar</span>
                </button>
              </div>

              {/* Balance Display */}
              <div className="flex items-center justify-between bg-[#2a1e14] px-3 py-2 rounded-lg border border-amber-900/40">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-200/80">Saldo Akun:</span>
                  <span className="text-sm sm:text-base font-extrabold text-amber-300 font-mono">
                    Rp {user.balance.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  onClick={onRefreshBalance}
                  title="Perbarui Saldo"
                  className="p-1 text-amber-400 hover:text-amber-200 transition-colors active:scale-90"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Financial Quick Action Buttons: DEPOSIT, WITHDRAW, RIWAYAT */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onOpenDeposit}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs tracking-wide shadow-md active:scale-95 transition-all"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  DEPOSIT
                </button>

                <button
                  onClick={onOpenWithdraw}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#3a2717] hover:bg-[#4d3521] text-amber-200 font-bold text-xs tracking-wide border border-amber-800/60 active:scale-95 transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  WITHDRAW
                </button>

                <button
                  onClick={onOpenHistory}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#271a10] hover:bg-[#362417] text-amber-300 font-semibold text-xs tracking-wide border border-amber-900/40 active:scale-95 transition-all"
                >
                  <History className="w-3.5 h-3.5" />
                  RIWAYAT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
