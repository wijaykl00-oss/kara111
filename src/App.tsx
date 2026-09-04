import React, { useState, useEffect } from 'react';
import {
  Flame,
  Star,
  Heart,
  MessageCircle,
  Sparkles,
  Search,
  RefreshCw,
  Trophy,
  CheckCircle2,
  X
} from 'lucide-react';
import { UserProfile, GameItem, TotoResultItem } from './types.ts';
import {
  HOT_GAMES,
  FREE_INDICATOR_GAMES,
  MOST_LIKED_GAMES,
  CASINO_PROVIDERS,
  CasinoProviderItem
} from './data/games.ts';

import { Header } from './components/Header.tsx';
import { Navigation, CategoryKey } from './components/Navigation.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { GamesSection } from './components/GamesSection.tsx';
import { TotoHistory } from './components/TotoHistory.tsx';
import { LiveCasinoSection } from './components/LiveCasinoSection.tsx';
import { SpinWheelBanner } from './components/SpinWheelBanner.tsx';
import { ExclusivePartners } from './components/ExclusivePartners.tsx';
import { BankInfo } from './components/BankInfo.tsx';
import { Footer } from './components/Footer.tsx';

// Modals
import { AuthModal } from './components/AuthModal.tsx';
import { DepositModal } from './components/DepositModal.tsx';
import { WithdrawModal } from './components/WithdrawModal.tsx';
import { TransactionHistoryModal } from './components/TransactionHistoryModal.tsx';
import { LuckyWheelModal } from './components/LuckyWheelModal.tsx';
import { SpacemanGameModal } from './components/SpacemanGameModal.tsx';
import { MahjongWinsGameModal } from './components/MahjongWinsGameModal.tsx';
import { SlotGameModal } from './components/SlotGameModal.tsx';
import { TotoBetModal } from './components/TotoBetModal.tsx';
import { LiveChatModal } from './components/LiveChatModal.tsx';
import { PromoModal } from './components/PromoModal.tsx';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('lobby');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  // Dynamic likes and Toto results
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [totoResults, setTotoResults] = useState<TotoResultItem[]>([
    { id: '1', market: 'LOTTO GENTING 19', code: 'LG-19', result: '9398', time: '19:31:22', date: 'Hari Ini' },
    { id: '2', market: 'LOTTO GENTING 22', code: 'LG-22', result: '7229', time: '22:31:22', date: 'Hari Ini' },
    { id: '3', market: 'LOTTO GENTING 20', code: 'LG-20', result: '9880', time: '20:31:22', date: 'Hari Ini' },
    { id: '4', market: 'LOTTO GENTING 21', code: 'LG-21', result: '2176', time: '21:31:22', date: 'Hari Ini' },
  ]);

  // Modals state
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'register' | 'forgot' }>({
    isOpen: false,
    mode: 'register'
  });
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isSpacemanOpen, setIsSpacemanOpen] = useState(false);
  const [selectedSlotGame, setSelectedSlotGame] = useState<GameItem | null>(null);
  const [selectedMahjongGame, setSelectedMahjongGame] = useState<GameItem | null>(null);
  const [selectedTotoMarket, setSelectedTotoMarket] = useState<TotoResultItem | null>(null);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ text: string; type?: 'info' | 'success' } | null>(null);

  const showToast = (text: string, type: 'info' | 'success' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('kara111_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    }

    // Fetch initial likes and toto results from backend
    fetchGameLikes();
    fetchTotoResults();
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('kara111_token');
        setToken(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGameLikes = async () => {
    try {
      const res = await fetch('/api/games/likes');
      const data = await res.json();
      if (data.likes) setLikesMap(data.likes);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTotoResults = async () => {
    try {
      const res = await fetch('/api/togel/results');
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setTotoResults(data.results.slice(0, 4));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Login handler
  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('kara111_token', data.token);
        showToast(`Selamat datang di KARA111, ${data.user.username}!`, 'success');
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleRegisterSuccess = (newUser: UserProfile, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('kara111_token', newToken);
    showToast(`Akun berhasil dibuat! Selamat datang di KARA111, ${newUser.username}.`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kara111_token');
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const handleRefreshBalance = async () => {
    if (!token) return;
    setIsRefreshingBalance(true);
    await fetchUserProfile(token);
    setTimeout(() => {
      setIsRefreshingBalance(false);
      showToast('Saldo akun telah diperbarui', 'info');
    }, 400);
  };

  const handleLikeToggle = async (gameId: string) => {
    try {
      const res = await fetch('/api/games/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, userId: user?.id })
      });
      const data = await res.json();
      if (data.likes !== undefined) {
        setLikesMap((prev) => ({ ...prev, [gameId]: data.likes }));
      }
      if (user && data.isLiked !== undefined) {
        const updatedFavs = data.isLiked
          ? [...user.favorites, gameId]
          : user.favorites.filter((id) => id !== gameId);
        setUser({ ...user, favorites: updatedFavs });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayGame = (game: GameItem) => {
    if (game.category === 'crash' || game.id.includes('spaceman')) {
      setIsSpacemanOpen(true);
    } else if (game.id.includes('mahjong')) {
      setSelectedMahjongGame(game);
    } else {
      setSelectedSlotGame(game);
    }
  };

  const handleSelectCasinoProvider = (provider: CasinoProviderItem) => {
    // Open the live table experience
    setSelectedSlotGame({
      id: provider.id,
      title: `${provider.name} LIVE`,
      provider: provider.name,
      category: 'casino',
      image: provider.dealerImg,
      likes: 999,
      rtp: 99.1
    });
  };

  const handleOpenTotoBet = (market: TotoResultItem) => {
    setSelectedTotoMarket(market);
  };

  // Filtered games based on active tab and search
  const allGames = [...HOT_GAMES, ...FREE_INDICATOR_GAMES, ...MOST_LIKED_GAMES];
  const uniqueGames = Array.from(new Map(allGames.map((g) => [g.id, g])).values());

  const filteredGames = uniqueGames.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.provider.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'lobby') return true;
    if (activeCategory === 'slot') return g.category === 'slot';
    if (activeCategory === 'casino') return g.category === 'casino';
    if (activeCategory === 'arcade') return g.category === 'arcade';
    if (activeCategory === 'togel') return false; // Togel renders its own section
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0d0805] text-amber-50 selection:bg-amber-500 selection:text-black font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#271b10] border border-amber-500 text-amber-200 text-xs font-bold shadow-2xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto flex flex-col min-h-screen">
        {/* Header & Auth Section */}
        <Header
          user={user}
          onLogin={handleLogin}
          onOpenRegister={() => setAuthModal({ isOpen: true, mode: 'register' })}
          onOpenForgotPass={() => setAuthModal({ isOpen: true, mode: 'forgot' })}
          onOpenDeposit={() => (user ? setIsDepositOpen(true) : setAuthModal({ isOpen: true, mode: 'register' }))}
          onOpenWithdraw={() => (user ? setIsWithdrawOpen(true) : setAuthModal({ isOpen: true, mode: 'register' }))}
          onOpenHistory={() => (user ? setIsHistoryOpen(true) : setAuthModal({ isOpen: true, mode: 'register' }))}
          onOpenLiveChat={() => setIsLiveChatOpen(true)}
          onLogout={handleLogout}
          onRefreshBalance={handleRefreshBalance}
          isRefreshingBalance={isRefreshingBalance}
        />

        {/* Navigation Categories */}
        <Navigation
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Main Content Body */}
        <main className="flex-1">
          {/* If on Lobby, render exact layout from screenshots */}
          {activeCategory === 'lobby' ? (
            <>
              {/* Hero Banner Carousel & Quick Buttons */}
              <HeroBanner
                onJoinGroup={() => setIsJoinGroupOpen(true)}
                onOpenPromos={() => setIsPromoOpen(true)}
                onLaunchSpaceman={() => setIsSpacemanOpen(true)}
              />

              {/* 1. Hot Games */}
              <GamesSection
                title="Hot Games"
                icon={Flame}
                iconColor="text-red-500"
                games={HOT_GAMES}
                likesMap={likesMap}
                userFavorites={user?.favorites || []}
                onLikeToggle={handleLikeToggle}
                onPlayGame={handlePlayGame}
              />

              {/* 2. Indikator Gratis Games */}
              <GamesSection
                title="Indikator Gratis Games"
                icon={Star}
                iconColor="text-amber-400"
                games={FREE_INDICATOR_GAMES}
                likesMap={likesMap}
                userFavorites={user?.favorites || []}
                onLikeToggle={handleLikeToggle}
                onPlayGame={handlePlayGame}
              />

              {/* 3. Toto History */}
              <TotoHistory
                results={totoResults}
                onOpenTotoBet={handleOpenTotoBet}
              />

              {/* 4. Paling Disukai */}
              <GamesSection
                title="Paling Disukai"
                icon={Heart}
                iconColor="text-rose-500"
                games={MOST_LIKED_GAMES}
                likesMap={likesMap}
                userFavorites={user?.favorites || []}
                onLikeToggle={handleLikeToggle}
                onPlayGame={handlePlayGame}
              />

              {/* 5. Live Casino */}
              <LiveCasinoSection
                onSelectCasino={handleSelectCasinoProvider}
              />

              {/* 6. Putar Roda Nya Dan Dapatkan Hadiahnya Banner */}
              <SpinWheelBanner
                onOpenWheel={() => setIsWheelOpen(true)}
                isLoggedIn={!!user}
              />

              {/* 7. Mitra Eksklusif */}
              <ExclusivePartners />

              {/* 8. Bank Info */}
              <BankInfo />
            </>
          ) : activeCategory === 'togel' ? (
            /* Dedicated Togel View */
            <div className="py-2">
              <TotoHistory
                results={totoResults}
                onOpenTotoBet={handleOpenTotoBet}
              />
              <div className="w-full max-w-4xl mx-auto px-3 my-4">
                <div className="p-4 rounded-2xl bg-[#191009] border border-amber-900/50 text-center">
                  <h3 className="text-base font-black text-amber-300 font-['Chakra_Petch'] mb-1">
                    PASARAN TOGEL RESMI KARA111
                  </h3>
                  <p className="text-xs text-amber-200/80 mb-3">
                    Diskon terbesar hingga 66% dengan perkalian kemenangan 4D x 3000, 3D x 400, 2D x 70!
                  </p>
                  <button
                    onClick={() => handleOpenTotoBet(totoResults[0])}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                  >
                    Pasang Angka Sekarang
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Category Filtered Games View (Slot, Live Casino, Sports, Arcade) */
            <div className="w-full max-w-4xl mx-auto px-3 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-amber-300 uppercase tracking-wide">
                  Koleksi {activeCategory === 'slot' ? 'Slot Gacor' : activeCategory === 'casino' ? 'Live Casino' : activeCategory}
                </h2>

                {/* Search input */}
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 w-3.5 h-3.5 text-amber-500" />
                  <input
                    type="text"
                    placeholder="Cari permainan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#21160d] border border-amber-900/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filteredGames.map((game) => (
                    <div key={game.id}>
                      <GamesSection
                        title=""
                        icon={Sparkles}
                        games={[game]}
                        likesMap={likesMap}
                        userFavorites={user?.favorites || []}
                        onLikeToggle={handleLikeToggle}
                        onPlayGame={handlePlayGame}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#170f08] rounded-2xl border border-amber-950/60">
                  <p className="text-sm font-bold text-amber-400">
                    Tidak ada permainan ditemukan untuk pencarian ini.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-black"
                  >
                    Reset Pencarian
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer onOpenLiveChat={() => setIsLiveChatOpen(true)} />
      </div>

      {/* MODALS */}
      {/* 1. Auth / Register Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* 2. Deposit Modal */}
      {user && (
        <DepositModal
          isOpen={isDepositOpen}
          user={user}
          onClose={() => setIsDepositOpen(false)}
          onDepositSuccess={(newBal) => {
            setUser({ ...user, balance: newBal });
            showToast('Deposit berhasil! Saldo akun bertambah.', 'success');
          }}
        />
      )}

      {/* 3. Withdraw Modal */}
      {user && (
        <WithdrawModal
          isOpen={isWithdrawOpen}
          user={user}
          onClose={() => setIsWithdrawOpen(false)}
          onWithdrawSuccess={(newBal) => {
            setUser({ ...user, balance: newBal });
            showToast('Permintaan penarikan dana berhasil diproses.', 'success');
          }}
        />
      )}

      {/* 4. Transaction History Modal */}
      {user && (
        <TransactionHistoryModal
          isOpen={isHistoryOpen}
          user={user}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* 5. Lucky Wheel Modal */}
      <LuckyWheelModal
        isOpen={isWheelOpen}
        user={user}
        onClose={() => setIsWheelOpen(false)}
        onOpenLogin={() => {
          setIsWheelOpen(false);
          setAuthModal({ isOpen: true, mode: 'register' });
        }}
        onBalanceUpdate={(newBal) => {
          if (user) setUser({ ...user, balance: newBal });
        }}
      />

      {/* 6. Spaceman Crash Game Modal */}
      <SpacemanGameModal
        isOpen={isSpacemanOpen}
        user={user}
        onClose={() => setIsSpacemanOpen(false)}
        onOpenLogin={() => {
          setIsSpacemanOpen(false);
          setAuthModal({ isOpen: true, mode: 'register' });
        }}
        onOpenDeposit={() => {
          setIsSpacemanOpen(false);
          setIsDepositOpen(true);
        }}
        onBalanceUpdate={(newBal) => {
          if (user) setUser({ ...user, balance: newBal });
        }}
      />

      {/* 7. Mahjong Wins 3 Modal */}
      <MahjongWinsGameModal
        isOpen={!!selectedMahjongGame}
        game={selectedMahjongGame}
        user={user}
        onClose={() => setSelectedMahjongGame(null)}
        onOpenLogin={() => {
          setSelectedMahjongGame(null);
          setAuthModal({ isOpen: true, mode: 'register' });
        }}
        onOpenDeposit={() => {
          setSelectedMahjongGame(null);
          setIsDepositOpen(true);
        }}
        onBalanceUpdate={(newBal) => {
          if (user) setUser({ ...user, balance: newBal });
        }}
      />

      {/* 8. Slot Machine Modal */}
      <SlotGameModal
        isOpen={!!selectedSlotGame}
        game={selectedSlotGame}
        user={user}
        onClose={() => setSelectedSlotGame(null)}
        onOpenLogin={() => {
          setSelectedSlotGame(null);
          setAuthModal({ isOpen: true, mode: 'register' });
        }}
        onOpenDeposit={() => {
          setSelectedSlotGame(null);
          setIsDepositOpen(true);
        }}
        onBalanceUpdate={(newBal) => {
          if (user) setUser({ ...user, balance: newBal });
        }}
      />

      {/* 8. Toto Bet Modal */}
      <TotoBetModal
        isOpen={!!selectedTotoMarket}
        market={selectedTotoMarket}
        user={user}
        onClose={() => setSelectedTotoMarket(null)}
        onOpenLogin={() => {
          setSelectedTotoMarket(null);
          setAuthModal({ isOpen: true, mode: 'register' });
        }}
        onBalanceUpdate={(newBal) => {
          if (user) setUser({ ...user, balance: newBal });
        }}
      />

      {/* 9. Live Chat Modal */}
      <LiveChatModal
        isOpen={isLiveChatOpen}
        user={user}
        onClose={() => setIsLiveChatOpen(false)}
      />

      {/* 10. Promo Modal */}
      <PromoModal
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        onClaim={() => {
          if (user) {
            setIsDepositOpen(true);
          } else {
            setAuthModal({ isOpen: true, mode: 'register' });
          }
        }}
      />

      {/* 11. Join WhatsApp Group Modal */}
      {isJoinGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-sm bg-[#1a120b] border border-green-500/60 rounded-2xl shadow-2xl p-5 text-center flex flex-col items-center">
            <button
              onClick={() => setIsJoinGroupOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2a1e14] text-amber-400 hover:text-white border border-amber-900/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center text-green-400 mb-3">
              <MessageCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-amber-300 font-['Chakra_Petch']">
              KOMUNITAS VIP KARA111
            </h3>
            <p className="text-xs text-amber-100/80 mt-1 mb-4 leading-relaxed">
              Dapatkan bocoran RTP slot live tertinggi setiap jam, prediksi toto akurat, dan giveaway harian eksklusif member WhatsApp & Telegram.
            </p>

            <a
              href="https://wa.me/?text=Halo%20Admin%20KARA111%20Saya%20Mau%20Join%20Grup%20VIP"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsJoinGroupOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>GABUNG GRUP WHATSAPP SEKARANG</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
