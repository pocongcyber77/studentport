import './load-env.js';
import express, { Express, Request, Response, NextFunction } from 'express';
import { authRouter } from './routes/auth.js';
import { studentRouter } from './routes/student.js';
import { teacherRouter } from './routes/teacher.js';
import { db } from './db.js';
import { isPostgresEnabled, pingDatabase } from './persist.js';

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

export type CreateApiAppOptions = {
  logRequests?: boolean;
};

/** Shared Express app for /api/* (local dev, Vercel serverless). */
export async function createApiApp(options: CreateApiAppOptions = {}): Promise<Express> {
  const { logRequests = true } = options;

  await db.ready();
  if (isPostgresEnabled()) {
    await pingDatabase();
  }

  const app = express();
  app.use(corsMiddleware);
  app.use(express.json({ limit: '6mb' }));

  if (logRequests) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.path}`);
      }
      next();
    });
  }

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

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'Terjadi kesalahan internal pada server.',
      message: err.message,
    });
  });

  return app;
}
