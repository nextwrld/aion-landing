// scripts/prerender.mjs
//
// Project-owned build-time prerender. Replaces `vite-prerender-plugin`,
// which left open `file://` import handles and a monkey-patched
// `globalThis.fetch` that prevented `npm run build` from exiting.
//
// This script:
//   1. Builds a server bundle of `src/prerender.tsx` via Vite's SSR build
//      API. Vite cleans up its own handles when the build resolves.
//   2. Dynamically imports the built server bundle (a normal path, not
//      `file://`) and calls its `prerender` export.
//   3. Reads `dist/index.html` (emitted by the main client build) and
//      injects the rendered Spanish markup into the `<div id="root"></div>`
//      placeholder.
//   4. Cleans up the temporary server bundle directory in a `finally`
//      block so failure paths cannot leave the temp dir behind.
//   5. Exits with code 0 on success, non-zero on any failure
//      (fail-closed). The process exit is deferred to a single point
//      after cleanup; validation errors throw, they never call
//      `process.exit` directly.
//
// Usage: `node scripts/prerender.mjs` (wired into the `build` npm script).

import { build } from 'vite'
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const serverOutDir = path.join(repoRoot, '.prerender-server')
const distIndexPath = path.join(repoRoot, 'dist', 'index.html')
const prerenderEntry = path.join(repoRoot, 'src', 'prerender.tsx')

function log(msg) {
  process.stdout.write(`[prerender] ${msg}\n`)
}

function err(msg) {
  process.stderr.write(`[prerender] ${msg}\n`)
}

// Validations and the main flow all throw. A single `try/catch/finally`
// below sets the exit code only after cleanup runs, so neither success
// nor failure paths can leave `.prerender-server/` behind.
async function buildServerBundle() {
  log('building server bundle…')
  await build({
    configFile: false,
    logLevel: 'warn',
    build: {
      ssr: prerenderEntry,
      outDir: serverOutDir,
      emptyOutDir: true,
      write: true,
      rollupOptions: {
        input: prerenderEntry,
        output: { format: 'esm', entryFileNames: 'prerender.mjs' },
      },
    },
  })
}

function loadPrerender() {
  const serverEntry = path.join(serverOutDir, 'prerender.mjs')
  if (!existsSync(serverEntry)) {
    throw new Error(`server bundle not found at ${serverEntry}`)
  }
  return import(serverEntry)
}

function injectIntoDist(html) {
  if (!existsSync(distIndexPath)) {
    throw new Error(`client build output not found at ${distIndexPath}`)
  }
  const template = readFileSync(distIndexPath, 'utf-8')
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html is missing the <div id="root"></div> placeholder')
  }
  const output = template.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`,
  )
  writeFileSync(distIndexPath, output)
}

async function main() {
  await buildServerBundle()

  const mod = await loadPrerender()
  const prerender = mod.prerender
  if (typeof prerender !== 'function') {
    throw new Error('server bundle has no `prerender` function export')
  }

  const result = await prerender()
  const html = typeof result === 'string' ? result : result?.html
  if (typeof html !== 'string' || html.length === 0) {
    throw new Error('prerender returned no HTML')
  }

  injectIntoDist(html)
  log('prerendered 1 page: /')
}

let exitCode = 0
try {
  await main()
} catch (e) {
  exitCode = 1
  err(e && e.stack ? e.stack : String(e))
} finally {
  // Single cleanup point. Runs on both success and failure so the
  // temp directory is never left behind, and runs after the exit
  // code is set so a cleanup failure cannot mask the original error.
  try {
    rmSync(serverOutDir, { recursive: true, force: true })
  } catch (cleanupErr) {
    if (exitCode === 0) {
      exitCode = 1
      err(`cleanup failed: ${cleanupErr && cleanupErr.stack ? cleanupErr.stack : String(cleanupErr)}`)
    }
  }
}

process.exitCode = exitCode
