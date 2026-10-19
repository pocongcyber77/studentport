import * as esbuild from 'esbuild';

/**
 * Vercel only compiles files under api/; server/ must be bundled into api/index.js.
 */
await esbuild.build({
  entryPoints: ['api/handler.ts'],
  outfile: 'api/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  logLevel: 'info',
});

console.log('[build] Wrote api/index.js for Vercel');
