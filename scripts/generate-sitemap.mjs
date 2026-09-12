import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const rawBaseUrl = process.env.SITE_URL?.trim()

if (!rawBaseUrl) {
  console.error('SITE_URL is required. Example: SITE_URL=https://example.com pnpm run generate:sitemap')
  process.exit(1)
}

let baseUrl
try {
  baseUrl = new URL(rawBaseUrl)
  if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('Unsupported protocol')
} catch {
  console.error('SITE_URL must be an absolute http(s) URL.')
  process.exit(1)
}

const routes = ['/', '/visualizer', '/topics', '/learn/arp', '/learn/routing', '/learn/nat-napt', '/glossary', '/about', '/guide', '/notes', '/privacy', '/terms']
const xmlEscape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${xmlEscape(new URL(route, baseUrl).toString())}</loc></url>`).join('\n')}\n</urlset>\n`

const outputPath = resolve('public/sitemap.xml')
await mkdir(resolve('public'), { recursive: true })
await writeFile(outputPath, sitemap, 'utf8')
console.log(`Wrote ${outputPath}`)
