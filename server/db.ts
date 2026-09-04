import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  referralCode?: string;
  balance: number;
  vipLevel: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  createdAt: string;
  favorites: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'SPIN_WIN' | 'GAME_WIN' | 'GAME_BET';
  amount: number;
  bankName: string;
  accountNumber?: string;
  accountHolder?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  notes: string;
  createdAt: string;
}

export interface TotoResult {
  id: string;
  market: string;
  code: string;
  result: string;
  time: string;
  date: string;
}

export interface TotoBet {
  id: string;
  userId: string;
  username: string;
  market: string;
  betType: '4D' | '3D' | '2D' | 'Colok Bebas';
  numbers: string;
  betAmount: number;
  potentialWin: number;
  status: 'PENDING' | 'WON' | 'LOST';
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  totoResults: TotoResult[];
  totoBets: TotoBet[];
  gameLikes: Record<string, number>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed
const initialTotoResults: TotoResult[] = [
  { id: '1', market: 'LOTTO GENTING 19', code: 'LG-19', result: '9398', time: '19:31:22', date: 'Hari Ini' },
  { id: '2', market: 'LOTTO GENTING 22', code: 'LG-22', result: '7229', time: '22:31:22', date: 'Hari Ini' },
  { id: '3', market: 'LOTTO GENTING 20', code: 'LG-20', result: '9880', time: '20:31:22', date: 'Hari Ini' },
  { id: '4', market: 'LOTTO GENTING 21', code: 'LG-21', result: '2176', time: '21:31:22', date: 'Hari Ini' },
  { id: '5', market: 'SINGAPORE 4D', code: 'SGP', result: '5421', time: '17:45:00', date: 'Hari Ini' },
  { id: '6', market: 'HONGKONG POOLS', code: 'HK', result: '8812', time: '23:00:00', date: 'Hari Ini' },
];

const initialGameLikes: Record<string, number> = {
  'ayam-nekat': 887,
  'sweet-bonanza': 416,
  'mahjong-wins-3': 989,
  'fortune-olympus': 123,
  'candyland': 491,
  'spaceman': 8473,
  'mega-wheel': 664,
  'big-bass-crash': 654,
  'mahjong-ways-2': 3434,
  'mahjong-ways': 3164,
  'high-flyer': 1460,
  'gates-of-olympus': 9520,
  'starlight-princess': 7310,
};

// Initial demo user
const initialUsers: User[] = [
  {
    id: 'user-demo-1',
    username: 'kara_member',
    password: 'password123',
    fullName: 'Member Setia Kara111',
    phone: '081234567890',
    bankName: 'BCA',
    accountNumber: '8271928374',
    accountHolder: 'KARA MEMBER',
    balance: 250000,
    vipLevel: 'Gold',
    createdAt: new Date().toISOString(),
    favorites: ['spaceman', 'sweet-bonanza', 'mahjong-ways-2']
  }
];

const initialTransactions: Transaction[] = [
  {
    id: 'TX-DP-001',
    userId: 'user-demo-1',
    username: 'kara_member',
    type: 'DEPOSIT',
    amount: 200000,
    bankName: 'BCA',
    status: 'APPROVED',
    notes: 'Deposit Otomatis QRIS / Transfer BCA',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'TX-SPIN-002',
    userId: 'user-demo-1',
    username: 'kara_member',
    type: 'SPIN_WIN',
    amount: 50000,
    bankName: 'KARA111 WHEEL',
    status: 'APPROVED',
    notes: 'Hadiah Putar Roda Keberuntungan',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

class Database {
  private data: DatabaseSchema;
  private isWriting = false;

  constructor() {
    this.ensureDirectory();
    this.data = this.readFromDisk();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || initialUsers,
          transactions: parsed.transactions || initialTransactions,
          totoResults: parsed.totoResults || initialTotoResults,
          totoBets: parsed.totoBets || [],
          gameLikes: { ...initialGameLikes, ...(parsed.gameLikes || {}) }
        };
      }
    } catch (e) {
      console.error('Error reading database file, using fallback defaults', e);
    }

    const defaultData: DatabaseSchema = {
      users: initialUsers,
      transactions: initialTransactions,
      totoResults: initialTotoResults,
      totoBets: [],
      gameLikes: initialGameLikes
    };
    this.saveToDisk(defaultData);
    return defaultData;
  }

  private saveToDisk(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database to disk', err);
    }
  }

  public async persist() {
    if (this.isWriting) return;
    this.isWriting = true;
    try {
      this.saveToDisk(this.data);
    } finally {
      this.isWriting = false;
    }
  }

  // --- User Operations ---
  public findUserByUsername(username: string): User | undefined {
    const clean = username.trim().toLowerCase();
    return this.data.users.find(u => u.username.toLowerCase() === clean);
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'balance' | 'vipLevel' | 'favorites'> & { initialBalance?: number }): User {
    const cleanUsername = userData.username.trim();
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      password: userData.password,
      fullName: userData.fullName || cleanUsername,
      phone: userData.phone || '',
      bankName: userData.bankName || 'BCA',
      accountNumber: userData.accountNumber || '',
      accountHolder: userData.accountHolder || userData.fullName || cleanUsername,
      referralCode: userData.referralCode || '',
      balance: userData.initialBalance !== undefined ? userData.initialBalance : 50000, // Welcome bonus saldo
      vipLevel: 'Bronze',
      createdAt: new Date().toISOString(),
      favorites: ['spaceman', 'sweet-bonanza']
    };

    this.data.users.push(newUser);

    // Add bonus transaction log
    if (newUser.balance > 0) {
      this.data.transactions.unshift({
        id: `TX-BONUS-${Date.now()}`,
        userId: newUser.id,
        username: newUser.username,
        type: 'DEPOSIT',
        amount: newUser.balance,
        bankName: 'KARA111 WELCOME',
        status: 'APPROVED',
        notes: 'Bonus Pendaftaran Member Baru KARA111',
        createdAt: new Date().toISOString()
      });
    }

    this.persist();
    return newUser;
  }

  public updateBalance(userId: string, deltaAmount: number): { success: boolean; newBalance: number; error?: string } {
    const user = this.findUserById(userId);
    if (!user) {
      return { success: false, newBalance: 0, error: 'User tidak ditemukan' };
    }

    if (deltaAmount < 0 && user.balance + deltaAmount < 0) {
      return { success: false, newBalance: user.balance, error: 'Saldo tidak mencukupi untuk transaksi ini' };
    }

    user.balance += deltaAmount;
    // Upgrade VIP based on balance or activities
    if (user.balance >= 1000000 && user.vipLevel !== 'VIP') {
      user.vipLevel = 'VIP';
    } else if (user.balance >= 500000 && user.vipLevel === 'Bronze') {
      user.vipLevel = 'Silver';
    }

    this.persist();
    return { success: true, newBalance: user.balance };
  }

  // --- Transaction Operations ---
  public createDeposit(userId: string, amount: number, bankName: string, notes?: string): Transaction {
    const user = this.findUserById(userId);
    if (!user) throw new Error('Pengguna tidak valid');

    const tx: Transaction = {
      id: `TX-DP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      username: user.username,
      type: 'DEPOSIT',
      amount,
      bankName,
      status: 'APPROVED', // Instant approval so user experience is smooth and no blocking bug!
      notes: notes || `Deposit via ${bankName}`,
      createdAt: new Date().toISOString()
    };

    user.balance += amount;
    this.data.transactions.unshift(tx);
    this.persist();
    return tx;
  }

  public createWithdraw(userId: string, amount: number, notes?: string): { success: boolean; transaction?: Transaction; error?: string } {
    const user = this.findUserById(userId);
    if (!user) return { success: false, error: 'Pengguna tidak ditemukan' };

    if (amount < 25000) {
      return { success: false, error: 'Minimal penarikan dana adalah Rp 25.000' };
    }

    if (user.balance < amount) {
      return { success: false, error: 'Saldo Anda tidak mencukupi' };
    }

    user.balance -= amount;

    const tx: Transaction = {
      id: `TX-WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      username: user.username,
      type: 'WITHDRAW',
      amount,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      accountHolder: user.accountHolder,
      status: 'APPROVED',
      notes: notes || `Penarikan ke ${user.bankName} - ${user.accountNumber}`,
      createdAt: new Date().toISOString()
    };

    this.data.transactions.unshift(tx);
    this.persist();
    return { success: true, transaction: tx };
  }

  public getTransactions(userId?: string): Transaction[] {
    if (userId) {
      return this.data.transactions.filter(t => t.userId === userId);
    }
    return this.data.transactions;
  }

  // --- Game Likes & Favorites ---
  public toggleGameLike(gameId: string, userId?: string): { likes: number; isLiked: boolean } {
    const current = this.data.gameLikes[gameId] || 100;
    let isLiked = false;

    if (userId) {
      const user = this.findUserById(userId);
      if (user) {
        const index = user.favorites.indexOf(gameId);
        if (index > -1) {
          user.favorites.splice(index, 1);
          this.data.gameLikes[gameId] = Math.max(0, current - 1);
          isLiked = false;
        } else {
          user.favorites.push(gameId);
          this.data.gameLikes[gameId] = current + 1;
          isLiked = true;
        }
      } else {
        this.data.gameLikes[gameId] = current + 1;
        isLiked = true;
      }
    } else {
      this.data.gameLikes[gameId] = current + 1;
      isLiked = true;
    }

    this.persist();
    return { likes: this.data.gameLikes[gameId], isLiked };
  }

  public getGameLikes(): Record<string, number> {
    return this.data.gameLikes;
  }

  // --- Lucky Spin Wheel ---
  public spinWheel(userId: string): { prizeName: string; amount: number; balance: number; message: string } {
    const prizes = [
      { name: 'Saldo Rp 5.000', amount: 5000, prob: 0.3 },
      { name: 'Saldo Rp 10.000', amount: 10000, prob: 0.25 },
      { name: 'Saldo Rp 25.000', amount: 25000, prob: 0.2 },
      { name: 'Saldo Rp 50.000', amount: 50000, prob: 0.15 },
      { name: 'Saldo Rp 100.000', amount: 100000, prob: 0.08 },
      { name: 'ZONK Coba Lagi', amount: 0, prob: 0.02 },
    ];

    const rand = Math.random();
    let cumulative = 0;
    let selected = prizes[0];

    for (const p of prizes) {
      cumulative += p.prob;
      if (rand <= cumulative) {
        selected = p;
        break;
      }
    }

    const user = this.findUserById(userId);
    let newBalance = 0;
    if (user && selected.amount > 0) {
      user.balance += selected.amount;
      newBalance = user.balance;

      this.data.transactions.unshift({
        id: `TX-WHEEL-${Date.now()}`,
        userId: user.id,
        username: user.username,
        type: 'SPIN_WIN',
        amount: selected.amount,
        bankName: 'KARA111 LUCKY WHEEL',
        status: 'APPROVED',
        notes: `Menang Lucky Spin: ${selected.name}`,
        createdAt: new Date().toISOString()
      });

      this.persist();
    } else if (user) {
      newBalance = user.balance;
    }

    return {
      prizeName: selected.name,
      amount: selected.amount,
      balance: newBalance,
      message: selected.amount > 0 ? `Selamat! Anda mendapatkan ${selected.name}!` : 'Sayang sekali ZONK, ayo coba putar lagi!'
    };
  }

  // --- Toto Bet & History ---
  public getTotoResults(): TotoResult[] {
    return this.data.totoResults;
  }

  public placeTotoBet(userId: string, betData: { market: string; betType: '4D' | '3D' | '2D' | 'Colok Bebas'; numbers: string; amount: number }): { success: boolean; bet?: TotoBet; balance?: number; error?: string } {
    const user = this.findUserById(userId);
    if (!user) return { success: false, error: 'User tidak ditemukan' };

    if (user.balance < betData.amount) {
      return { success: false, error: 'Saldo tidak mencukupi untuk memasang nomor ini' };
    }

    user.balance -= betData.amount;

    let multiplier = 70; // 2D multiplier default
    if (betData.betType === '4D') multiplier = 3000;
    if (betData.betType === '3D') multiplier = 400;
    if (betData.betType === 'Colok Bebas') multiplier = 1.5;

    const bet: TotoBet = {
      id: `TB-${Date.now()}`,
      userId: user.id,
      username: user.username,
      market: betData.market,
      betType: betData.betType,
      numbers: betData.numbers,
      betAmount: betData.amount,
      potentialWin: betData.amount * multiplier,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.data.totoBets.unshift(bet);
    this.data.transactions.unshift({
      id: `TX-TOTO-${Date.now()}`,
      userId: user.id,
      username: user.username,
      type: 'GAME_BET',
      amount: betData.amount,
      bankName: 'TOTO LOTTO GENTING',
      status: 'APPROVED',
      notes: `Pasang ${betData.betType} [${betData.numbers}] di ${betData.market}`,
      createdAt: new Date().toISOString()
    });

    this.persist();
    return { success: true, bet, balance: user.balance };
  }

  public getTotoBets(userId: string): TotoBet[] {
    return this.data.totoBets.filter(b => b.userId === userId);
  }
}

export const db = new Database();
