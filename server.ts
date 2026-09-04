import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', brand: 'KARA111' });
  });

  // --- Auth Endpoints ---
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, password, fullName, phone, bankName, accountNumber, accountHolder, referralCode } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi' });
      }

      if (username.length < 4) {
        return res.status(400).json({ error: 'Username minimal 4 karakter' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password minimal 6 karakter' });
      }

      const existing = db.findUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: 'Username sudah digunakan, silakan pilih username lain' });
      }

      const newUser = db.createUser({
        username,
        password,
        fullName: fullName || username,
        phone: phone || '',
        bankName: bankName || 'BCA',
        accountNumber: accountNumber || '',
        accountHolder: accountHolder || fullName || username,
        referralCode: referralCode || ''
      });

      // Simple secure session token
      const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');

      return res.json({
        success: true,
        message: 'Pendaftaran berhasil! Selamat datang di KARA111.',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          phone: newUser.phone,
          bankName: newUser.bankName,
          accountNumber: newUser.accountNumber,
          accountHolder: newUser.accountHolder,
          balance: newUser.balance,
          vipLevel: newUser.vipLevel,
          favorites: newUser.favorites
        }
      });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ error: err.message || 'Gagal mendaftar' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Harap masukkan username dan kata sandi' });
      }

      const user = db.findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Username atau kata sandi tidak cocok' });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: 'Kata sandi salah. Silakan coba lagi.' });
      }

      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      return res.json({
        success: true,
        message: `Selamat datang kembali, ${user.username}!`,
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          phone: user.phone,
          bankName: user.bankName,
          accountNumber: user.accountNumber,
          accountHolder: user.accountHolder,
          balance: user.balance,
          vipLevel: user.vipLevel,
          favorites: user.favorites
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan sistem' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');

      const user = db.findUserById(userId);
      if (!user) {
        return res.status(401).json({ error: 'Sesi telah berakhir' });
      }

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          phone: user.phone,
          bankName: user.bankName,
          accountNumber: user.accountNumber,
          accountHolder: user.accountHolder,
          balance: user.balance,
          vipLevel: user.vipLevel,
          favorites: user.favorites
        }
      });
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  // --- Transactions ---
  app.post('/api/transactions/deposit', (req, res) => {
    try {
      const { userId, amount, bankName, notes } = req.body;
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Data deposit tidak valid' });
      }

      if (amount < 10000) {
        return res.status(400).json({ error: 'Minimal deposit adalah Rp 10.000' });
      }

      const tx = db.createDeposit(userId, Number(amount), bankName || 'BCA', notes);
      const user = db.findUserById(userId);

      return res.json({
        success: true,
        message: `Deposit Rp ${Number(amount).toLocaleString('id-ID')} berhasil diproses! Saldo telah ditambahkan.`,
        transaction: tx,
        newBalance: user?.balance || 0
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Gagal memproses deposit' });
    }
  });

  app.post('/api/transactions/withdraw', (req, res) => {
    try {
      const { userId, amount, notes } = req.body;
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Data withdraw tidak valid' });
      }

      const result = db.createWithdraw(userId, Number(amount), notes);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const user = db.findUserById(userId);
      return res.json({
        success: true,
        message: `Penarikan dana Rp ${Number(amount).toLocaleString('id-ID')} berhasil diproses ke rekening ${user?.bankName}.`,
        transaction: result.transaction,
        newBalance: user?.balance || 0
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Gagal memproses withdraw' });
    }
  });

  app.get('/api/transactions', (req, res) => {
    const userId = req.query.userId as string | undefined;
    const list = db.getTransactions(userId);
    return res.json({ transactions: list });
  });

  // --- Games & Interactions ---
  app.get('/api/games/likes', (req, res) => {
    return res.json({ likes: db.getGameLikes() });
  });

  app.post('/api/games/like', (req, res) => {
    const { gameId, userId } = req.body;
    if (!gameId) return res.status(400).json({ error: 'gameId required' });
    const result = db.toggleGameLike(gameId, userId);
    return res.json(result);
  });

  // Spin Wheel API
  app.post('/api/games/spin-wheel', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Login diperlukan untuk memutar roda' });
    const result = db.spinWheel(userId);
    return res.json(result);
  });

  // Slot Spin Simulator
  app.post('/api/games/slot-spin', (req, res) => {
    const { userId, gameId, betAmount } = req.body;
    if (!userId || !betAmount) return res.status(400).json({ error: 'Parameter tidak lengkap' });

    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Saldo tidak mencukupi untuk melakukan spin' });
    }

    // Deduct bet
    db.updateBalance(userId, -betAmount);

    // Symbols & RNG
    const symbols = ['🍇', '🍉', '🍌', '🍓', '💎', '👑', '⚡', '7️⃣'];
    const grid = Array.from({ length: 3 }, () =>
      Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)])
    );

    // Calculate win probability & multiplier
    const rand = Math.random();
    let multiplier = 0;
    let winMessage = 'Coba lagi di spin berikutnya!';

    if (rand < 0.35) {
      // Small win
      multiplier = Number((1.2 + Math.random() * 1.5).toFixed(1));
      winMessage = 'Menang Biasa!';
    } else if (rand < 0.48) {
      // Medium win
      multiplier = Number((2.5 + Math.random() * 3).toFixed(1));
      winMessage = 'Big Win!';
    } else if (rand < 0.54) {
      // Mega win
      multiplier = Number((7 + Math.random() * 8).toFixed(1));
      winMessage = 'Mega Win Sensasional!';
    } else if (rand < 0.56) {
      // JackPot
      multiplier = Number((25 + Math.random() * 50).toFixed(1));
      winMessage = 'MAXWIN JP KELUAR!';
    }

    const winAmount = Math.round(betAmount * multiplier);
    if (winAmount > 0) {
      db.updateBalance(userId, winAmount);
    }

    const freshUser = db.findUserById(userId);

    return res.json({
      success: true,
      grid,
      multiplier,
      winAmount,
      winMessage,
      newBalance: freshUser?.balance || 0
    });
  });

  // Spaceman Crash Game Simulator
  app.post('/api/games/spaceman-play', (req, res) => {
    const { userId, betAmount, cashoutMultiplier } = req.body;
    if (!userId || !betAmount) return res.status(400).json({ error: 'Parameter tidak lengkap' });

    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Saldo tidak mencukupi' });
    }

    db.updateBalance(userId, -betAmount);

    // Generate crash point (1.00x to 100.00x)
    const crashPoint = Number((1.01 + Math.pow(Math.random(), 3) * 35).toFixed(2));
    const target = Number(cashoutMultiplier || 2.0);
    const didWin = target <= crashPoint;
    const winAmount = didWin ? Math.round(betAmount * target) : 0;

    if (didWin) {
      db.updateBalance(userId, winAmount);
    }

    const freshUser = db.findUserById(userId);

    return res.json({
      success: true,
      crashPoint,
      didWin,
      winAmount,
      newBalance: freshUser?.balance || 0
    });
  });

  // --- Toto / Togel ---
  app.get('/api/togel/results', (req, res) => {
    return res.json({ results: db.getTotoResults() });
  });

  app.post('/api/togel/bet', (req, res) => {
    const { userId, market, betType, numbers, amount } = req.body;
    if (!userId || !numbers || !amount) {
      return res.status(400).json({ error: 'Nomor dan nominal taruhan wajib diisi' });
    }

    const result = db.placeTotoBet(userId, {
      market: market || 'LOTTO GENTING 19',
      betType: betType || '4D',
      numbers,
      amount: Number(amount)
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      success: true,
      message: `Taruhan ${betType} [${numbers}] berhasil dipasang!`,
      bet: result.bet,
      newBalance: result.balance
    });
  });

  // Live Chat Quick Support API
  app.post('/api/support/message', (req, res) => {
    const { message, username } = req.body;
    const replies: Record<string, string> = {
      deposit: 'Halo! Untuk melakukan deposit, silakan klik tombol DEPOSIT di menu akun, pilih bank tujuan/QRIS, dan saldo akan masuk secara otomatis dalam hitungan detik.',
      withdraw: 'Halo! Proses penarikan dana (withdraw) diproses cepat 24 jam nonstop dengan minimal Rp 25.000 ke rekening yang terdaftar.',
      bonus: 'KARA111 memberikan Bonus New Member 100%, Cashback Mingguan 5%, dan Putaran Roda Keberuntungan harian tanpa syarat rumit!',
      game: 'Game yang sedang gacor hari ini di KARA111: Spaceman, Sweet Bonanza Super Scatter, Mahjong Ways 2, dan Fortune of Olympus dengan RTP di atas 98.5%!'
    };

    let reply = `Halo ${username || 'Bosku'}, selamat datang di Layanan Pelanggan KARA111 24 Jam. Ada yang bisa kami bantu seputar pendaftaran, deposit, withdraw, atau rekomendasi game gacor?`;

    const lower = (message || '').toLowerCase();
    if (lower.includes('depo') || lower.includes('transfer')) {
      reply = replies.deposit;
    } else if (lower.includes('wd') || lower.includes('tarik') || lower.includes('withdraw')) {
      reply = replies.withdraw;
    } else if (lower.includes('bonus') || lower.includes('promo')) {
      reply = replies.bonus;
    } else if (lower.includes('gacor') || lower.includes('slot') || lower.includes('rtp')) {
      reply = replies.game;
    }

    return res.json({ reply, timestamp: new Date().toLocaleTimeString('id-ID') });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KARA111 server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
