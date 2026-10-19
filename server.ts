import './server/load-env.js';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiApp } from './server/api-app.js';
import { isPostgresEnabled } from './server/persist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  const serveStatic = process.env.SERVE_STATIC === 'true' || !isProduction;

  if (isProduction && !isPostgresEnabled()) {
    console.error('[Server] DATABASE_URL is required in production (Neon Postgres).');
    process.exit(1);
  }

  const app = await createApiApp();

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] API listening on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Storage: ${isPostgresEnabled() ? 'neon' : 'file'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
