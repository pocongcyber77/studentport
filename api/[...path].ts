import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import { createApiApp } from '../server/api-app.js';

/** Express sends the response itself; Vercel must not wait for the handler promise. */
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export const maxDuration = 30;

type ServerlessHandler = (
  req: VercelRequest,
  res: VercelResponse
) => Promise<unknown>;

let handlerPromise: Promise<ServerlessHandler> | null = null;

async function getHandler(): Promise<ServerlessHandler> {
  if (!handlerPromise) {
    handlerPromise = createApiApp({ logRequests: false }).then((app) =>
      serverless(app) as ServerlessHandler
    );
  }
  return handlerPromise;
}

export default async function vercelApi(req: VercelRequest, res: VercelResponse) {
  const handler = await getHandler();
  return handler(req, res);
}
