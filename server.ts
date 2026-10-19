import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/auth.js';
import { studentRouter } from './server/routes/student.js';
import { teacherRouter } from './server/routes/teacher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Request logger
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/teacher', teacherRouter);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Personal Learning Journey API',
      timestamp: new Date().toISOString(),
    });
  });

  // Client mounting (Vite dev server middleware or static build)
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
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'Terjadi kesalahan internal pada server.',
      message: err.message,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Personal Learning Journey running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
