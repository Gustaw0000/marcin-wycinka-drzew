const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(compression());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

const HTML_CACHE = 'public, max-age=300';
const ASSET_CACHE = 'public, max-age=31536000, immutable';

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), now: new Date().toISOString() });
});

app.get('/robots.txt', (req, res) => {
  const url = siteUrl(req);
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    `Sitemap: ${url}/sitemap.xml`,
    ''
  ].join('\n');
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', HTML_CACHE);
  res.send(body);
});

const SITEMAP_PATHS = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/#uslugi', priority: '0.7', changefreq: 'weekly' },
  { path: '/#obszar', priority: '0.7', changefreq: 'weekly' },
  { path: '/#proces', priority: '0.6', changefreq: 'weekly' },
  { path: '/#realizacje', priority: '0.6', changefreq: 'weekly' },
  { path: '/#opinie', priority: '0.5', changefreq: 'weekly' },
  { path: '/#kontakt', priority: '0.7', changefreq: 'weekly' },
  { path: '/#faq', priority: '0.5', changefreq: 'weekly' },
  { path: '/polityka-prywatnosci', priority: '0.3', changefreq: 'yearly' },
  { path: '/regulamin', priority: '0.3', changefreq: 'yearly' }
];

app.get('/sitemap.xml', (req, res) => {
  const url = siteUrl(req);
  const lastmod = new Date().toISOString();
  const urls = SITEMAP_PATHS.map(item => `  <url>
    <loc>${url}${item.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    <xhtml:link rel="alternate" hreflang="pl-PL" href="${url}${item.path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}${item.path}"/>
  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', HTML_CACHE);
  res.send(xml);
});

app.get('/.well-known/security.txt', (req, res) => {
  const url = siteUrl(req);
  const body = [
    'Contact: mailto:kontakt@example.pl',
    'Preferred-Languages: pl, en',
    `Canonical: ${url}/.well-known/security.txt`,
    'Expires: 2027-01-01T00:00:00.000Z',
    ''
  ].join('\n');
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', HTML_CACHE);
  res.send(body);
});

app.get('/sitemap-index.xml', (req, res) => {
  const url = siteUrl(req);
  const lastmod = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${url}/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', HTML_CACHE);
  res.send(xml);
});

function serveHtml(filename) {
  return (req, res) => {
    const file = path.join(__dirname, 'public', filename);
    fs.readFile(file, 'utf8', (err, html) => {
      if (err) return res.status(500).send('Blad serwera');
      const url = siteUrl(req);
      const lastModified = new Date().toISOString();
      const out = html
        .replace(/\{\{SITE_URL\}\}/g, url)
        .replace(/\{\{LAST_MODIFIED\}\}/g, lastModified);
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.set('Cache-Control', HTML_CACHE);
      res.send(out);
    });
  };
}

app.get('/', serveHtml('index.html'));
app.get('/polityka-prywatnosci', serveHtml('polityka-prywatnosci.html'));
app.get('/regulamin', serveHtml('regulamin.html'));

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.html', '.xml', '.txt', '.json'].includes(ext)) {
      res.setHeader('Cache-Control', HTML_CACHE);
    } else if (['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) {
      res.setHeader('Cache-Control', ASSET_CACHE);
    } else if (['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico', '.css', '.js'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

app.use((req, res) => {
  res.status(404);
  const file = path.join(__dirname, 'public', '404.html');
  fs.readFile(file, 'utf8', (err, html) => {
    if (err) return res.type('text/plain').send('404, nie znaleziono');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Serwer slucha na porcie ${PORT}`);
});
