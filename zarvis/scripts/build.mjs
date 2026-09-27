/** Bundles src/worker.js (+ the Anthropic SDK) into public/_worker.js for Cloudflare Pages advanced mode. */
import { build } from 'esbuild';
await build({
  entryPoints: ['src/worker.js'],
  outfile: 'public/_worker.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  conditions: ['workerd', 'worker', 'browser'],
  target: 'es2022',
  minify: true,
  legalComments: 'none',
  banner: { js: '// Zarvis worker, built from src/worker.js. Edit the source and run `npm run build`.' }
});
console.log('built public/_worker.js');
