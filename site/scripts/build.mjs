import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_STORE_URL = 'https://apps.apple.com/jo/app/splitpass/id6740179181';

const root = fileURLToPath(new URL('../../', import.meta.url));
const escape = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const publicUrl = (value) => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) {
    throw new Error('Expected a public HTTPS URL without credentials or fragment');
  }
  return url.href;
};

const seeded = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const illustrativeQr = (seed, size = 25) => {
  const next = seeded(seed);
  const finder = (x, y) => {
    const inFinder = (ox, oy) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    const edge = (ox, oy) => {
      const dx = x - ox;
      const dy = y - oy;
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    };
    for (const [ox, oy] of [[0, 0], [size - 7, 0], [0, size - 7]]) if (inFinder(ox, oy)) return edge(ox, oy);
    return null;
  };
  const quiet = (x, y) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
  let d = '';
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const fixed = finder(x, y);
      const on = fixed === null ? !quiet(x, y) && next() > 0.5 : fixed;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return `<svg class="qr" viewBox="-1 -1 ${size + 2} ${size + 2}" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect class="paper" x="-1" y="-1" width="${size + 2}" height="${size + 2}"/><path d="${d}"/></svg>`;
};

const storeLink = (href, icon, label, caption, primary) => {
  const content = `<svg class="platform-icon" aria-hidden="true" focusable="false"><use href="assets/platforms.svg#${icon}"></use></svg><span>${label}<small>${caption}</small></span>`;
  const cls = `button store${primary ? ' primary' : ''}`;
  return href
    ? `<a class="${cls}" href="${escape(href)}">${content}</a>`
    : `<span class="${cls} link-pending" aria-disabled="true">${content}</span>`;
};

export const render = (template, { version, extensionVersion }, config = {}) => {
  const appStore = publicUrl(config.appStore || APP_STORE_URL);
  if (new URL(appStore).hostname !== 'apps.apple.com') throw new Error('Invalid App Store URL');
  const playStore = config.playStore ? publicUrl(config.playStore) : '';
  if (playStore && new URL(playStore).origin !== 'https://play.google.com') throw new Error('Invalid Google Play URL');
  const tokens = {
    VERSION: escape(version),
    EXTENSION_VERSION: escape(extensionVersion),
    CANONICAL: config.siteUrl ? `<link rel="canonical" href="${escape(publicUrl(config.siteUrl).replace(/\/$/, ''))}/">` : '',
    APP_STORE_HERO: `<a class="button primary" href="${escape(appStore)}"><svg class="platform-icon" aria-hidden="true" focusable="false"><use href="assets/platforms.svg#apple"></use></svg><span>Download for iPhone &amp; iPad</span><span class="download-arrow" aria-hidden="true">↗</span></a>`,
    APP_STORE: storeLink(appStore, 'apple', 'App Store', 'iPhone &amp; iPad ↗', true),
    PLAY_STORE: storeLink(playStore, 'android', 'Google Play', playStore ? 'Android ↗' : 'Android · soon', false),
    QR_PANEL: illustrativeQr(2077, 21),
  };
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in tokens)) throw new Error(`Unknown template token: ${key}`);
    return tokens[key];
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const { version: extensionVersion } = JSON.parse(await readFile(path.join(root, 'browser-extension/manifest.json'), 'utf8'));
  const output = path.resolve(process.env.SITE_OUTPUT || path.join(root, 'site/dist'));
  const html = render(await readFile(path.join(root, 'site/index.html'), 'utf8'), { version, extensionVersion }, {
    siteUrl: process.env.SITE_URL,
    appStore: process.env.APP_STORE_URL,
    playStore: process.env.PLAY_STORE_URL,
  });
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'index.html'), html);
  await cp(path.join(root, 'site/styles.css'), path.join(output, 'styles.css'));
  await cp(path.join(root, 'site/theme.js'), path.join(output, 'theme.js'));
  await cp(path.join(root, 'site/assets'), path.join(output, 'assets'), { recursive: true });
  await cp(path.join(output, 'assets/fonts'), path.join(output, 'assets'), { recursive: true });
  await rm(path.join(output, 'assets/fonts'), { recursive: true, force: true });
  await writeFile(
    path.join(output, '_headers'),
    "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'\n",
  );
  console.log(`Built static site: ${output}`);
}
