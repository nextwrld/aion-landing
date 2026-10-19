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
//   3. Reads `dist/index.html` (emitted by the main client build) once as a
//      template and, for every exported route, injects the rendered Spanish
//      markup into `<div id="root"></div>` and replaces the
//      `<!--seo:start-->...<!--seo:end-->` block with that route's head tags.
//      Output: `dist/index.html`, `dist/<route>/index.html`, `dist/404.html`
//      and a generated `dist/sitemap.xml`.
//   4. Cleans up the temporary server bundle directory in a `finally`
//      block so failure paths cannot leave the temp dir behind.
//   5. Exits with code 0 on success, non-zero on any failure
//      (fail-closed). The process exit is deferred to a single point
//      after cleanup; validation errors throw, they never call
//      `process.exit` directly.
//
// Usage: `node scripts/prerender.mjs` (wired into the `build` npm script).

import { build } from 'vite'
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const serverOutDir = path.join(repoRoot, '.prerender-server')
const distDir = path.join(repoRoot, 'dist')
const distIndexPath = path.join(distDir, 'index.html')
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

const SEO_BLOCK_RE = /<!--seo:start-->[\s\S]*?<!--seo:end-->/

function readTemplate() {
  if (!existsSync(distIndexPath)) {
    throw new Error(`client build output not found at ${distIndexPath}`)
  }
  const template = readFileSync(distIndexPath, 'utf-8')
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html is missing the <div id="root"></div> placeholder')
  }
  if (!SEO_BLOCK_RE.test(template)) {
    throw new Error('dist/index.html is missing the <!--seo:start--> ... <!--seo:end--> block')
  }
  return template
}

// "/" -> dist/index.html, "/404" -> dist/404.html, "/a/b" -> dist/a/b/index.html
function outputPathFor(route) {
  if (route === '/') return distIndexPath
  if (route === '/404') return path.join(distDir, '404.html')
  return path.join(distDir, ...route.split('/').filter(Boolean), 'index.html')
}

function renderPage(template, html, head) {
  if (typeof html !== 'string' || html.length === 0) {
    throw new Error('prerender returned no HTML')
  }
  if (typeof head !== 'string' || head.length === 0) {
    throw new Error('prerender returned no head tags')
  }
  return template
    .replace(SEO_BLOCK_RE, () => head)
    .replace('<div id="root"></div>', () => `<div id="root">${html}</div>`)
}

async function main() {
  await buildServerBundle()

  const mod = await loadPrerender()
  const { prerender, routes, sitemap } = mod
  if (typeof prerender !== 'function') {
    throw new Error('server bundle has no `prerender` function export')
  }
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error('server bundle has no `routes` array export')
  }

  // Read the pristine template once, before dist/index.html is overwritten.
  const template = readTemplate()

  for (const route of routes) {
    const result = await prerender(route)
    const out = outputPathFor(route)
    mkdirSync(path.dirname(out), { recursive: true })
    writeFileSync(out, renderPage(template, result?.html, result?.head))
  }

  if (typeof sitemap === 'function') {
    writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap())
  }

  log(`prerendered ${routes.length} pages: ${routes.join(', ')}`)
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
