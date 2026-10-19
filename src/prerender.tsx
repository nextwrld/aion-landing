import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { NOT_FOUND_PATH, PRERENDER_PATHS } from './site/routes'
import { buildHeadTags, buildSitemap } from './site/seo'

/** Paths to render at build time; `/404` renders the not-found page. */
export const routes: string[] = [...PRERENDER_PATHS, NOT_FOUND_PATH]

export async function prerender(url: string = '/') {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
  return { html, head: buildHeadTags(url) }
}

export function sitemap(): string {
  return buildSitemap()
}
