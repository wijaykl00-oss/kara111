import { GameItem } from '../types.ts';

// 1. Hot Games (Full list from screenshots)
export const HOT_GAMES: GameItem[] = [
  {
    id: 'ayam-nekat',
    title: 'AYAM NEKAT',
    provider: 'NANO ARCADE',
    category: 'arcade',
    image: '/games/ayam_nekat.jpg',
    isHot: true,
    likes: 886,
    rtp: 98.4
  },
  {
    id: 'sweet-bonanza',
    title: 'SWEET BONANZA...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/sweet_bonanza.jpg',
    isHot: true,
    likes: 416,
    rtp: 98.8
  },
  {
    id: 'mahjong-wins-3',
    title: 'MAHJONG WINS 3 -...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/mahjong_wins_3.jpg',
    isHot: true,
    likes: 989,
    rtp: 97.9
  },
  {
    id: 'fortune-olympus',
    title: 'FORTUNE OF...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/fortune_olympus.jpg',
    isHot: true,
    likes: 122,
    rtp: 98.5
  },
  {
    id: 'gates-of-olympus',
    title: 'GATES OF OLYMPUS',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/fortune_olympus.jpg',
    isHot: true,
    likes: 528,
    rtp: 98.9
  },
  {
    id: 'gates-of-gatotkaca-1000',
    title: 'GATES OF GATOT...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 357,
    rtp: 98.1
  },
  {
    id: 'aztec-ancients',
    title: 'AZTEC ANCIENTS',
    provider: 'OCTOPLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 66,
    rtp: 96.7
  },
  {
    id: '2d-wheel',
    title: '2D WHEEL',
    provider: 'NANO CASINO',
    category: 'arcade',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 90,
    rtp: 97.2
  },
  {
    id: 'sweet-bonanza-1000',
    title: 'SWEET BONANZA...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/sweet_bonanza.jpg',
    isHot: true,
    likes: 410,
    rtp: 98.7
  },
  {
    id: 'gates-of-olympus-1000',
    title: 'GATES OF OLYMPUS...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/fortune_olympus.jpg',
    isHot: true,
    likes: 292,
    rtp: 99.0
  },
  {
    id: '24d-super',
    title: '24D SUPER',
    provider: 'NANO CASINO',
    category: 'arcade',
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 28,
    rtp: 96.8
  },
  {
    id: 'gates-of-olympus-scatter',
    title: 'GATES OF OLYMPUS...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/fortune_olympus.jpg',
    isHot: true,
    likes: 191,
    rtp: 98.6
  },
  {
    id: 'eggsponential',
    title: 'EGGSPONENTIAL',
    provider: 'OCTOPLAY',
    category: 'slot',
    image: '/games/eggsponential.png',
    isHot: true,
    likes: 262,
    rtp: 97.4
  },
  {
    id: 'starlight-princess-1000',
    title: 'STARLIGHT PRINCES...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 147,
    rtp: 98.9
  }
];

// 2. Indikator Gratis Games (Full list from screenshots)
export const FREE_INDICATOR_GAMES: GameItem[] = [
  {
    id: 'candyland',
    title: 'SWEET BONANZA...',
    provider: 'PRAGMATIC PLAY',
    category: 'casino',
    image: '/games/candyland.jpg',
    isLive: true,
    likes: 491,
    rtp: 96.5
  },
  {
    id: 'spaceman',
    title: 'SPACEMAN',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: '/games/spaceman.png',
    likes: 8468,
    rtp: 99.2
  },
  {
    id: 'mega-wheel',
    title: 'MEGA WHEEL',
    provider: 'PRAGMATIC PLAY',
    category: 'casino',
    image: '/games/mega_wheel.png',
    isLive: true,
    likes: 664,
    rtp: 97.1
  },
  {
    id: 'big-bass-crash',
    title: 'BIG BASS CRASH™',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: '/games/big_bass_crash.png',
    likes: 654,
    rtp: 97.8
  },
  {
    id: 'treasure-island',
    title: 'TREASURE ISLAND',
    provider: 'PRAGMATIC PLAY',
    category: 'casino',
    image: '/games/treasure_island.png',
    isLive: true,
    likes: 82,
    rtp: 96.6
  },
  {
    id: 'high-flyer',
    title: 'HIGH FLYER',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: '/games/high_flyer.png',
    likes: 1460,
    rtp: 98.2
  }
];

// 3. Paling Disukai (Full list from screenshots)
export const MOST_LIKED_GAMES: GameItem[] = [
  {
    id: 'spaceman-fav',
    title: 'SPACEMAN',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: '/games/spaceman.png',
    likes: 8468,
    rtp: 99.2
  },
  {
    id: 'mahjong-ways-2',
    title: 'MAHJONG WAYS 2',
    provider: 'PGSOFT',
    category: 'slot',
    image: '/games/mahjong_wins_3.jpg',
    likes: 3433,
    rtp: 98.7
  },
  {
    id: 'mahjong-ways',
    title: 'MAHJONG WAYS',
    provider: 'PGSOFT',
    category: 'slot',
    image: '/games/mahjong_wins_3.jpg',
    likes: 3164,
    rtp: 97.5
  },
  {
    id: 'high-flyer-fav',
    title: 'HIGH FLYER',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/high_flyer.png',
    likes: 1460,
    rtp: 96.9
  },
  {
    id: 'mahjong-wins-3-fav',
    title: 'MAHJONG WINS 3 -...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/mahjong_wins_3.jpg',
    isHot: true,
    likes: 989,
    rtp: 97.9
  },
  {
    id: 'ayam-nekat-fav',
    title: 'AYAM NEKAT',
    provider: 'NANO ARCADE',
    category: 'arcade',
    image: '/games/ayam_nekat.jpg',
    isHot: true,
    likes: 886,
    rtp: 98.4
  },
  {
    id: 'wild-bounty',
    title: 'WILD BOUNTY...',
    provider: 'PGSOFT',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    likes: 831,
    rtp: 97.8
  },
  {
    id: 'mega-wheel-fav',
    title: 'MEGA WHEEL',
    provider: 'PRAGMATIC PLAY',
    category: 'casino',
    image: '/games/mega_wheel.png',
    isLive: true,
    likes: 664,
    rtp: 97.1
  },
  {
    id: 'big-bass-crash-fav',
    title: 'BIG BASS CRASH™',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: '/games/big_bass_crash.png',
    likes: 654,
    rtp: 97.8
  },
  {
    id: 'gates-of-olympus-fav',
    title: 'GATES OF OLYMPUS',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/fortune_olympus.jpg',
    isHot: true,
    likes: 528,
    rtp: 98.9
  },
  {
    id: 'candyland-fav',
    title: 'SWEET BONANZA...',
    provider: 'PRAGMATIC PLAY',
    category: 'casino',
    image: '/games/candyland.jpg',
    isLive: true,
    likes: 491,
    rtp: 96.5
  },
  {
    id: 'sweet-bonanza-scatter-fav',
    title: 'SWEET BONANZA...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/sweet_bonanza.jpg',
    isHot: true,
    likes: 416,
    rtp: 98.8
  },
  {
    id: 'wild-bandito',
    title: 'WILD BANDITO',
    provider: 'PGSOFT',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    likes: 413,
    rtp: 98.2
  },
  {
    id: 'gates-of-gatotkaca-fav',
    title: 'GATES OF GATOT...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 357,
    rtp: 98.1
  },
  {
    id: 'gates-of-olympus-1000-fav',
    title: 'GATES OF OLYMPUS...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: '/games/fortune_olympus.jpg',
    isHot: true,
    likes: 292,
    rtp: 99.0
  }
];

// Live Casino Providers (8 Cards from screenshot)
export interface CasinoProviderItem {
  id: string;
  name: string;
  logo: string;
  badge?: string;
  dealerImg: string;
}

export const CASINO_PROVIDERS: CasinoProviderItem[] = [
  {
    id: 'pragmatic',
    name: 'PRAGMATIC PLAY',
    logo: 'PRAGMATIC PLAY',
    badge: '👑',
    dealerImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'evolution',
    name: 'Evolution Gaming',
    logo: 'Evolution Gaming',
    dealerImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'dream',
    name: 'DREAMGAMING',
    logo: 'DREAMGAMING',
    dealerImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'sexy',
    name: 'Sexy GAMING',
    logo: 'Sexy GAMING',
    dealerImg: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'joker',
    name: 'JOKER GAMING',
    logo: 'JOKER GAMING',
    dealerImg: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'sbobet',
    name: 'SBOBET',
    logo: 'SBOBET',
    dealerImg: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'sa-gaming',
    name: 'SA GAMING',
    logo: 'SA GAMING',
    dealerImg: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'wm-casino',
    name: 'WM CASINO',
    logo: 'WM CASINO',
    dealerImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80'
  }
];

export const PARTNERS_LIST = [
  'nano lottery', 'PRAGMATIC PLAY', 'JOKER GAMING', 'HABANERO', 'Evolution Gaming', 'Microgaming',
  'RELAX GAMING', "PLAY'N GO", 'Spadegaming', 'PG POCKET GAMES SOFT', 'SBOBET', 'DREAMGAMING',
  'SA GAMING', 'SABA SPORTS', 'Sexy GAMING', 'WM CASINO', 'SV388', 'LG POKER',
  'ALLBET', 'UNITED GAMING', 'M8 BET', 'CMD368', 'PLAYSTAR', 'YGGDRAZIL',
  'ION SLOT', 'NEXTSPIN', 'NOLIMIT CITY', 'RED TIGER', 'NETENT', 'BIG TIME GAMING',
  'BTI', 'DRAGON GAMING', 'OCTOPLAY', 'YB LIVE', 'POP GAMING', 'nano CASINO', 'nano ARCADE'
];
