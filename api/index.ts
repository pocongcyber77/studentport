import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';
import { createApiApp } from '../server/api-app';

export const maxDuration = 30;

let appPromise: Promise<Express> | null = null;

function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = createApiApp({ logRequests: true });
  }
  return appPromise;
}

/** Vercel invokes this for /api/* (see vercel.json rewrites). Express handles req/res directly. */
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
