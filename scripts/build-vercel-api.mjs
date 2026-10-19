import * as esbuild from 'esbuild';

/**
 * Vercel only ships api/* as functions. Bundle server/ into a single api/index.js.
 * Keep zero .ts files in api/ so Vercel does not emit a broken index.js.
 */
await esbuild.build({
  entryPoints: ['server/vercel-handler.ts'],
  outfile: 'api/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  logLevel: 'info',
});

console.log('[build] Wrote api/index.js for Vercel');
