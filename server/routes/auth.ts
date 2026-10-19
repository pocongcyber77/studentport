import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const authRouter = Router();

// In a real app we can use session cookies or JWT. Here we support session header or token cookie.
export function getAuthenticatedUser(req: Request) {
  // Support custom header 'x-user-id' or query / body for flexible testing
  const authHeader = req.headers['authorization'];
  let userId = req.headers['x-user-id'] as string;

  if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.replace('Bearer ', '').trim();
  }

  if (!userId && req.cookies && req.cookies.user_id) {
    userId = req.cookies.user_id;
  }

  if (!userId) {
    return null;
  }

  const user = db.getUserById(userId);
  return user || null;
}

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
    return;
  }

  const user = db.getUserByEmail(email.trim());
  if (!user) {
    res.status(401).json({ error: 'Akun dengan email ini tidak ditemukan.' });
    return;
  }

  const expectedPassword = user.password || 'password123';
  if (password !== expectedPassword && password !== 'password123') {
    res.status(401).json({ error: 'Kata sandi tidak sesuai. (Kata sandi default: password123)' });
    return;
  }

  // Audit login
  db.addAuditLog(user.id, user.name, user.role, 'USER_LOGIN', { email: user.email });

  res.json({
    message: 'Login berhasil',
    token: user.id, // ID acts as session token in demo
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      student_profile: user.role === 'student' ? db.getStudentByUserId(user.id) : null,
    },
  });
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Sesi tidak valid' });
    return;
  }

  let studentProfile = null;
  if (user.role === 'student') {
    studentProfile = db.getStudentByUserId(user.id);
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      student_profile: studentProfile,
    },
  });
});

// POST /api/auth/switch-user (quick switcher for testing roles)
authRouter.post('/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    return;
  }

  res.json({
    message: `Beralih ke akun ${user.name} (${user.role})`,
    token: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      student_profile: user.role === 'student' ? db.getStudentByUserId(user.id) : null,
    },
  });
});

// GET /api/auth/users-list (for demo role switching in header)
authRouter.get('/demo-accounts', (_req: Request, res: Response) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    student_profile: u.role === 'student' ? db.getStudentByUserId(u.id) : null,
  }));
  res.json({ users });
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    db.addAuditLog(user.id, user.name, user.role, 'USER_LOGOUT', {});
  }
  res.json({ message: 'Logout berhasil' });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'Email tidak terdaftar dalam sistem.' });
    return;
  }
  res.json({
    message: 'Tautan reset kata sandi telah dikirimkan ke email Anda (Simulasi).',
    token: 'reset-sim-token-12345',
  });
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', (_req: Request, res: Response) => {
  res.json({
    message: 'Kata sandi Anda berhasil diperbarui. Silakan login kembali.',
  });
});
