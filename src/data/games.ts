import { GameItem } from '../types.ts';

export const HOT_GAMES: GameItem[] = [
  {
    id: 'ayam-nekat',
    title: 'AYAM NEKAT',
    provider: 'NANO ARCADE',
    category: 'arcade',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 887,
    rtp: 98.4
  },
  {
    id: 'sweet-bonanza',
    title: 'SWEET BONANZA...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 416,
    rtp: 98.8
  },
  {
    id: 'mahjong-wins-3',
    title: 'MAHJONG WINS 3 -...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 989,
    rtp: 97.9
  },
  {
    id: 'fortune-olympus',
    title: 'FORTUNE OF...',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    isHot: true,
    likes: 123,
    rtp: 98.5
  }
];

export const FREE_INDICATOR_GAMES: GameItem[] = [
  {
    id: 'candyland',
    title: 'SWEET BONANZA...',
    provider: 'PRAGMATIC PLAY',
    category: 'casino',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80',
    likes: 491,
    rtp: 96.5
  },
  {
    id: 'spaceman',
    title: 'SPACEMAN',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    likes: 8473,
    rtp: 99.2
  },
  {
    id: 'mega-wheel',
    title: 'MEGA WHEEL',
    provider: 'PRAGMATIC PLAY',
    category: 'casino',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    likes: 664,
    rtp: 97.1
  },
  {
    id: 'big-bass-crash',
    title: 'BIG BASS CRASH',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80',
    likes: 654,
    rtp: 97.8
  }
];

export const MOST_LIKED_GAMES: GameItem[] = [
  {
    id: 'spaceman-fav',
    title: 'SPACEMAN',
    provider: 'PRAGMATIC PLAY',
    category: 'crash',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    likes: 8473,
    rtp: 99.2
  },
  {
    id: 'mahjong-ways-2',
    title: 'MAHJONG WAYS 2',
    provider: 'PGSOFT',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    likes: 3434,
    rtp: 98.7
  },
  {
    id: 'mahjong-ways',
    title: 'MAHJONG WAYS',
    provider: 'PGSOFT',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
    likes: 3164,
    rtp: 97.5
  },
  {
    id: 'high-flyer',
    title: 'HIGH FLYER',
    provider: 'PRAGMATIC PLAY',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=500&auto=format&fit=crop&q=80',
    likes: 1460,
    rtp: 96.9
  }
];

export interface CasinoProviderItem {
  id: string;
  name: string;
  logo: string;
  dealerImg: string;
}

export const CASINO_PROVIDERS: CasinoProviderItem[] = [
  {
    id: 'pragmatic',
    name: 'PRAGMATIC PLAY',
    logo: 'Pragmatic Play',
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
  'NANO LOTTERY', 'PRAGMATIC PLAY', 'JOKER GAMING', 'HABANERO', 'EVOLUTION GAMING', 'MICROGAMING',
  'RELAX GAMING', "PLAY'N GO", 'SPADEGAMING', 'PG SOFT', 'SBOBET', 'DREAM GAMING',
  'SA GAMING', 'SABA SPORTS', 'SEXY GAMING', 'WM CASINO', 'SV388', 'LG POKER',
  'ALLBET', 'UNITED GAMING', 'M8 BET', 'CMD368', 'PLAYSTAR', 'YGGDRAZIL',
  'ION SLOT', 'NEXTSPIN', 'NOLIMIT CITY', 'RED TIGER', 'NETENT', 'BIG TIME GAMING',
  'BTI', 'DRAGON GAMING', 'OCTOPLAY', 'YB LIVE', 'POP GAMING', 'NANO ARCADE'
];
