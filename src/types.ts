export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  vipLevel: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  favorites: string[];
}

export interface GameItem {
  id: string;
  title: string;
  provider: string;
  category: 'slot' | 'casino' | 'arcade' | 'crash' | 'togel' | 'sports';
  image: string;
  isHot?: boolean;
  likes: number;
  rtp?: number;
}

export interface TotoResultItem {
  id: string;
  market: string;
  code: string;
  result: string;
  time: string;
  date: string;
}

export interface TransactionItem {
  id: string;
  userId: string;
  username: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'SPIN_WIN' | 'GAME_WIN' | 'GAME_BET';
  amount: number;
  bankName: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  notes: string;
  createdAt: string;
}
