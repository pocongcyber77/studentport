import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/auth.js';
import { studentRouter } from './server/routes/student.js';
import { teacherRouter } from './server/routes/teacher.js';
import { db } from './server/db.js';
import { isPostgresEnabled, pingDatabase } from './server/persist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (/^http:\/\/localhost:\d+$/i.test(origin)) return true;
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) return true;
  const allowed = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowed.includes('*')) return true;
  return allowed.includes(origin);
}

function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-user-id'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  const serveStatic = process.env.SERVE_STATIC === 'true' || !isProduction;

  if (isProduction && !isPostgresEnabled()) {
    console.error('[Server] DATABASE_URL is required in production (Neon Postgres).');
    process.exit(1);
  }

  await db.ready();
  if (isPostgresEnabled()) {
    await pingDatabase();
  }

  app.use(corsMiddleware);
  app.use(express.json({ limit: '6mb' }));

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  app.use('/api/auth', authRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/teacher', teacherRouter);

  app.get('/api/health', async (_req: Request, res: Response) => {
    let postgres = false;
    if (isPostgresEnabled()) {
      try {
        postgres = await pingDatabase();
      } catch {
        postgres = false;
      }
    }
    const ok = !isPostgresEnabled() || postgres;
    res.status(ok ? 200 : 503).json({
      status: ok ? 'ok' : 'degraded',
      service: 'Personal Learning Journey API',
      storage: isPostgresEnabled() ? 'neon' : 'file',
      postgres,
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (serveStatic) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'Terjadi kesalahan internal pada server.',
      message: err.message,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] API listening on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Storage: ${isPostgresEnabled() ? 'neon' : 'file'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
