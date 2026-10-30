import { build } from 'esbuild'

// BX 1.1.1 publishes extensionless ESM imports. Bundle its real runtime for Node
// instead of patching the package or relying on Bun's resolver in production.
await build({
  entryPoints: { server: 'src/features/photo-guide/server.ts', local: 'scripts/photo-server.ts' },
  outdir: '.bx', outExtension: { '.js': '.mjs' }, bundle: true,
  platform: 'node', format: 'esm', target: 'node22', sourcemap: false,
  external: ['sharp', 'bun', 'bun:*', 'next/*', '@aws-sdk/*'],
  plugins: [{ name: 'bx-server-public-subset', setup(builder) {
    builder.onLoad({ filter: /@dahura\/bx\/dist\/index\.js$/ }, () => ({
      // Keep the real runtime exports while excluding CLI-only Bun Glob checks.
      contents: 'export {createBX} from "./bx.js"; export {bxPlugin} from "./plugin.js"; export {BXError} from "./errors.js";',
      loader: 'js', resolveDir: new URL('../node_modules/@dahura/bx/dist/', import.meta.url).pathname,
    }))
    builder.onLoad({ filter: /@dahura\/bx\/dist\/db\/adapters\/bun-sqlite\.js$/ }, () => ({
      // This app has no database. Fail explicitly if a future Node route asks for Bun SQLite.
      contents: 'export function createBunSQLiteAdapter(){ throw new Error("BX Node profile: Bun SQLite unavailable; this app uses no database."); }',
      loader: 'js',
    }))
  } }],
  banner: { js: "import { createRequire as __bxCreateRequire } from 'node:module'; const require = __bxCreateRequire(import.meta.url);" },
  logLevel: 'warning',
})
console.log('BX runtime bundled for Node22 (server + local adapter).')
