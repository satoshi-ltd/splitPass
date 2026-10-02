import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const vm = require('node:vm');

const ROOT = path.join(__dirname, '..', '..');
const SCRIPT = path.join(ROOT, 'site', 'scripts', 'build.mjs');
const ALLOWED_HOSTS = ['github.com', 'www.satoshi-ltd.com', 'apps.apple.com', 'play.google.com'];

const build = (env = {}) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'splitpass-site-'));
  const run = spawnSync(process.execPath, [SCRIPT], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, SITE_OUTPUT: output, ...env },
  });
  return { ...run, output, html: () => fs.readFileSync(path.join(output, 'index.html'), 'utf8') };
};

describe('site build', () => {
  it('carries the app and extension versions and leaves no template token behind', () => {
    const { status, html } = build();
    const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const extension = JSON.parse(fs.readFileSync(path.join(ROOT, 'browser-extension', 'manifest.json'), 'utf8')).version;

    expect(status).toBe(0);
    expect(html()).toContain(`v${version}`);
    expect(html()).toContain(`version ${extension}`);
    expect(html()).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it('ships every local file the page references and nothing from the network at load time', () => {
    const { output, html } = build();
    const page = html();
    const css = fs.readFileSync(path.join(output, 'styles.css'), 'utf8');
    const locals = [...page.matchAll(/(?:href|src)="(?!https?:|#|mailto:)([^"#]+)/g)].map((m) => m[1]);
    const fonts = [...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);

    expect(locals.length).toBeGreaterThan(3);
    for (const file of [...locals, ...fonts, 'styles.css', '_headers']) {
      expect(fs.existsSync(path.join(output, file))).toBe(true);
    }
    expect(css).not.toMatch(/url\(["']?https?:/);
    expect(page.match(/<script\b[^>]*>/g)).toEqual(['<script src="theme.js">']);
    expect(page).not.toMatch(/<iframe\b/);
    expect(page).not.toMatch(/\sstyle="/);
  });

  it('ships a stylesheet whose braces balance and whose media queries are never nested', () => {
    const { output } = build();
    const css = fs.readFileSync(path.join(output, 'styles.css'), 'utf8');
    const depthAt = (index) => {
      const before = css.slice(0, index);
      return before.split('{').length - before.split('}').length;
    };
    const nested = [...css.matchAll(/@media/g)].filter((match) => depthAt(match.index) !== 0);

    expect(css).not.toMatch(/grid-template-columns: 1fr;/);
    expect(css).toMatch(/\.download-grid > \*[^{]*\{[^}]*min-width: 0;/);
    expect(depthAt(css.length)).toBe(0);
    expect(nested).toHaveLength(0);
    expect(css.match(/\.theme-btn \{/g)).toHaveLength(1);
    expect(depthAt(css.indexOf('.theme-btn {'))).toBe(0);
  });

  it('keeps a sticky header with the version and a download link to a real section', () => {
    const { output, html } = build();
    const css = fs.readFileSync(path.join(output, 'styles.css'), 'utf8');
    const header = html().split('<header')[1].split('</header>')[0];
    const targets = [...header.matchAll(/href="#([a-z-]+)"/g)].map((m) => m[1]);

    expect(css).toMatch(/\.masthead \{[^}]*position: sticky;[^}]*top: 0;/);
    expect(targets).toHaveLength(1);
    expect(html()).toContain(`id="${targets[0]}"`);
    expect(header).toContain('class="nav-cta');
    expect(header).not.toContain('<ul');
  });

  it('links only to known hosts', () => {
    const { html } = build({ PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=x' });
    const hosts = new Set([...html().matchAll(/href="(https:\/\/[^"/]+)/g)].map((m) => new URL(m[1]).hostname));

    expect([...hosts].every((host) => ALLOWED_HOSTS.includes(host))).toBe(true);
  });

  it('links the App Store listing by default and keeps Google Play pending until it is configured', () => {
    const pending = build().html();
    const live = build({ PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=x' }).html();

    expect(pending).toContain('https://apps.apple.com/jo/app/splitpass/id6740179181');
    expect(pending).toContain('link-pending');
    expect(live).not.toContain('link-pending');
    expect(live).toContain('https://play.google.com/store/apps/details?id=x');
  });

  it('lets APP_STORE_URL override the default listing', () => {
    expect(build({ APP_STORE_URL: 'https://apps.apple.com/us/app/splitpass/id1' }).html()).toContain(
      'https://apps.apple.com/us/app/splitpass/id1',
    );
  });

  it.each([
    ['APP_STORE_URL', 'https://example.com/app'],
    ['APP_STORE_URL', 'http://apps.apple.com/app/id1'],
    ['PLAY_STORE_URL', 'https://evil.example/store/apps'],
    ['SITE_URL', 'https://user:pass@example.com'],
  ])('rejects %s=%s', (key, value) => {
    const { status, stderr } = build({ [key]: value });

    expect(status).not.toBe(0);
    expect(stderr).toMatch(/Invalid|Expected a public HTTPS URL/);
  });

  it('adds a canonical link only when SITE_URL is set', () => {
    expect(build().html()).not.toContain('rel="canonical"');
    expect(build({ SITE_URL: 'https://splitpass.satoshi-ltd.com' }).html()).toContain(
      '<link rel="canonical" href="https://splitpass.satoshi-ltd.com/">',
    );
  });

  it('draws the same illustrative QR for the same build', () => {
    const first = build().html();
    const second = build().html();

    expect(first).toBe(second);
    expect(first).toContain('class="qr"');
  });

  it('serves a content security policy that blocks inline and remote content', () => {
    const { output } = build();
    const headers = fs.readFileSync(path.join(output, '_headers'), 'utf8');

    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("frame-ancestors 'none'");
  });

  it('captures every app screen from a screen the design kit still draws', () => {
    const script = `
      import { readFileSync } from 'node:fs';
      import { SCREENS, pick } from ${JSON.stringify(path.join(ROOT, 'site', 'scripts', 'screens.mjs'))};
      const html = readFileSync(${JSON.stringify(path.join(ROOT, 'design', 'mobile.html'))}, 'utf8');
      console.log(JSON.stringify(SCREENS.map((screen) => [screen.file, pick(html, screen).startsWith('<div class="m-phone')])));
    `;
    const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' });
    const picked = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(picked.length).toBeGreaterThanOrEqual(6);
    for (const [file, found] of picked) {
      expect(found).toBe(true);
      expect(fs.existsSync(path.join(ROOT, 'site', 'assets', 'screens', `${file}.png`))).toBe(true);
    }
  });

  it('deploys to Cloudflare Pages from main only, with the production origin and a configuration check', () => {
    const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'publish-site.yml'), 'utf8');

    expect(workflow).toContain('SITE_URL: https://splitpass.satoshi-ltd.com');
    expect(workflow).toContain("if: github.ref == 'refs/heads/main'");
    expect(workflow).toContain('branches: [main]');
    expect(workflow).not.toContain('pull_request');
    expect(workflow).toContain('persist-credentials: false');
    expect(workflow).toContain('node-version-file: .nvmrc');
    for (const key of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_PAGES_PROJECT_NAME']) {
      expect(workflow).toContain(`test -n "\${!key}"`);
      expect(workflow).toContain(key);
    }
    expect(workflow).toMatch(/wrangler@4/);
    expect(workflow).toContain('pages deploy site/dist');
    expect(workflow).toContain('--branch=main');
  });

  it('offers a theme switch that follows the system until the reader picks one', () => {
    const { output, html } = build();
    const css = fs.readFileSync(path.join(output, 'styles.css'), 'utf8');

    expect(html()).toContain('class="theme-btn"');
    expect(html()).toMatch(/class="sun"[\s\S]*class="moon"/);
    expect(css).toContain(':root:not([data-theme="light"])');
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain(':root[data-theme="light"] .theme-btn .sun');
  });

  describe('theme.js', () => {
    const run = ({ systemDark, stored }) => {
      const listeners = { click: [] };
      const meta = { content: '', setAttribute(name, value) { this.content = value; } };
      const button = { label: '', setAttribute(name, value) { this.label = value; } };
      const root = { dataset: {} };
      const store = stored ? { 'splitpass-theme': stored } : {};
      const context = {
        matchMedia: () => ({ matches: systemDark, addEventListener() {} }),
        localStorage: { getItem: (key) => store[key] ?? null, setItem: (key, value) => { store[key] = value; } },
        document: {
          documentElement: root,
          querySelector: (selector) => (selector === 'meta[name="theme-color"]' ? meta : selector === '.theme-btn' ? button : null),
          addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); },
        },
      };
      vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'site', 'theme.js'), 'utf8'), context);
      const click = () => listeners.click.forEach((fn) => fn({ target: { closest: () => ({}) } }));
      return { root, meta, button, store, click };
    };

    it('takes the system theme when nothing is stored', () => {
      expect(run({ systemDark: true }).root.dataset.theme).toBe('dark');
      expect(run({ systemDark: false }).root.dataset.theme).toBe('light');
    });

    it('lets a stored choice beat the system and ignores junk', () => {
      expect(run({ systemDark: true, stored: 'light' }).root.dataset.theme).toBe('light');
      expect(run({ systemDark: false, stored: 'dark' }).root.dataset.theme).toBe('dark');
      expect(run({ systemDark: true, stored: 'sepia' }).root.dataset.theme).toBe('dark');
    });

    it('toggles on click, remembers the pick and keeps the browser chrome and label in step', () => {
      const page = run({ systemDark: false });
      page.click();

      expect(page.root.dataset.theme).toBe('dark');
      expect(page.store['splitpass-theme']).toBe('dark');
      expect(page.meta.content).toBe('#12100e');
      expect(page.button.label).toBe('Switch to light theme');
    });
  });
});
