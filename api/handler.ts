import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';
import { createApiApp } from '../server/api-app.js';

export const maxDuration = 30;

let appPromise: Promise<Express> | null = null;

function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = createApiApp({ logRequests: true });
  }
  return appPromise;
}

/** Bundled to api/index.js on Vercel build. Express handles req/res directly. */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err) {
    console.error('[api] handler failed:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'API initialization failed',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
