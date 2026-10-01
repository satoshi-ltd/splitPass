import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.join(__dirname, '..', '..');
const DESIGN = path.join(ROOT, 'design');
const PAGES = ['index.html', 'browser-extension.html', 'mobile.html', 'proposals.html'];
const KIT_STYLES = ['kit.css', 'mobile.css'];
const GENERATED_STYLES = ['mobile-tokens.css', 'extension-tokens.css', 'mobile-icons.css'];

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const readDesign = (file) => read(path.join('design', file));
const run = (...args) => spawnSync(process.execPath, [path.join(DESIGN, 'build.mjs'), ...args], { encoding: 'utf8' });

const EXTENSION_SCRIPTS = ['popup.js', 'content.js', 'lib/scanner-ui.js', 'lib/secret-item.js'].map((file) => read(path.join('browser-extension', file))).join('\n');

const isExtensionHook = (name) =>
  name.startsWith('splitpass-') && (EXTENSION_SCRIPTS.includes(name) || (name.startsWith('splitpass-item-') && EXTENSION_SCRIPTS.includes(name.slice('splitpass'.length))));

const stripCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/url\([^)]*\)/g, '')
    .replace(/"[^"]*"|'[^']*'/g, '');

const cssClasses = (css) => new Set([...stripCss(css).matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((match) => match[1]));

const htmlClasses = (html) => {
  const names = new Set();
  for (const [, list] of html.matchAll(/\sclass="([^"]*)"/g)) list.split(/\s+/).filter(Boolean).forEach((name) => names.add(name));
  return names;
};

const localReferences = (html) =>
  [...html.matchAll(/<(?:a|link|script|img)\b[^>]*?\s(?:href|src)="([^"]*)"/g)]
    .map((match) => match[1])
    .filter((ref) => ref && !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(ref))
    .map((ref) => ref.split(/[?#]/)[0])
    .filter(Boolean);

const linkedStyles = (html) =>
  [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((href) => !/^[a-z][a-z0-9+.-]*:/i.test(href));

const withRoadmap = (markdown) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'splitpass-roadmap-'));
  const file = path.join(dir, 'ROADMAP.md');
  fs.writeFileSync(file, markdown);
  return file;
};

const LANES = (queue = '_None._', progress = '_None._', creator = '_None._', proposed = '_None._') =>
  `# Roadmap\n\n## Queue\n\n${queue}\n\n## In progress\n\n${progress}\n\n## Needs creator\n\n${creator}\n\n## Proposed\n\n${proposed}\n`;

const TASK = (id = 'TASK-ONE', depends = '') =>
  `- **${id}** — A title with \`code\`\n  \`chore · agent · normal${depends ? ` · depends: ${depends}` : ''}\`\n  accept: it works\n  and keeps working\n`;

describe('design kit', () => {
  it('has generated files that match src/theme, the extension theme, the boards, ROADMAP.md, the release version and the shared header', () => {
    const { status, stderr } = run('--check');

    expect(stderr).toBe('');
    expect(status).toBe(0);
  });

  it('is a self-contained module with its contract, a CLAUDE.md pointer and no generator left in scripts', () => {
    expect(fs.existsSync(path.join(DESIGN, 'AGENTS.md'))).toBe(true);
    if (fs.existsSync(path.join(DESIGN, 'CLAUDE.md'))) expect(readDesign('CLAUDE.md').trim()).toBe('@AGENTS.md');
    ['build.mjs', 'src/pages.mjs', 'src/tokens.mjs', 'src/proposals.mjs', 'src/draw.mjs'].forEach((file) => {
      expect({ file, exists: fs.existsSync(path.join(DESIGN, file)) }).toEqual({ file, exists: true });
    });
    expect(fs.readdirSync(path.join(ROOT, 'scripts')).filter((file) => /design/i.test(file) && file !== '__tests__')).toEqual([]);
    expect(JSON.parse(read('package.json')).scripts.design).toBe('node design/build.mjs');
  });

  it('stamps the package version on every page', () => {
    const { version } = JSON.parse(read('package.json'));

    PAGES.forEach((page) => {
      expect(readDesign(page)).toContain(`<span class="kit-version">v${version} · production</span>`);
    });
  });

  it('has no Open work page and ends every nav with Proposals', () => {
    expect(fs.existsSync(path.join(DESIGN, 'open-work.html'))).toBe(false);
    PAGES.forEach((page) => {
      const html = readDesign(page);
      const nav = [...html.match(/<nav class="kit-nav"[^>]*>([\s\S]*?)<\/nav>/)[1].matchAll(/<a href="([^"]+)"/g)].map((match) => match[1]);

      expect({ page, nav }).toEqual({ page, nav: PAGES });
      expect(html).not.toMatch(/open-work|Open work/);
    });
  });

  it('gives every page the nav and both theme buttons', () => {
    PAGES.forEach((page) => {
      const html = readDesign(page);

      PAGES.forEach((target) => expect(html).toContain(`href="${target}"`));
      expect(html).toContain('data-kit-theme="light"');
      expect(html).toContain('data-kit-theme="dark"');
      expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    });
  });

  it('links only files that exist', () => {
    PAGES.forEach((page) => {
      localReferences(readDesign(page)).forEach((ref) => {
        expect({ page, ref, exists: fs.existsSync(path.join(DESIGN, ref)) }).toEqual({ page, ref, exists: true });
      });
    });
  });

  it('gives every page a favicon that is a copy of the project icon inside design/', () => {
    const pages = fs.readdirSync(DESIGN).filter((file) => file.endsWith('.html'));
    expect(pages.length).toBe(PAGES.length);
    const source = fs.readFileSync(path.join(ROOT, 'assets', 'favicon.png'));
    pages.forEach((page) => {
      const hrefs = [...readDesign(page).matchAll(/<link rel="icon" href="([^"]*)">/g)].map((match) => match[1]);
      expect({ page, hrefs }).toEqual({ page, hrefs: ['favicon.png'] });
      expect({ page, same: fs.readFileSync(path.join(DESIGN, hrefs[0])).equals(source) }).toEqual({ page, same: true });
    });
  });

  it('points every stylesheet url() at an existing file', () => {
    [...KIT_STYLES, ...GENERATED_STYLES].forEach((file) => {
      [...readDesign(file).matchAll(/url\("?([^)"]+)"?\)/g)]
        .map((match) => match[1])
        .filter((ref) => !/^(?:[a-z][a-z0-9+.-]*:|data:)/i.test(ref))
        .forEach((ref) => expect({ file, ref, exists: fs.existsSync(path.join(DESIGN, ref)) }).toEqual({ file, ref, exists: true }));
    });
  });

  it('uses only classes that the linked stylesheets define', () => {
    PAGES.forEach((page) => {
      const html = readDesign(page);
      const defined = new Set();
      linkedStyles(html).forEach((href) => cssClasses(fs.readFileSync(path.join(DESIGN, href), 'utf8')).forEach((name) => defined.add(name)));
      const usesExtension = linkedStyles(html).some((href) => href.includes('browser-extension/'));
      const unknown = [...htmlClasses(html)].filter((name) => !defined.has(name) && !(usesExtension && isExtensionHook(name)));

      expect({ page, unknown }).toEqual({ page, unknown: [] });
    });
  });

  it('renders the browser extension page with the real extension stylesheets', () => {
    const styles = linkedStyles(readDesign('browser-extension.html'));

    ['theme.css', 'item.css', 'scanner-ui.css', 'popup.css', 'content.css', 'camera-access.css'].forEach((sheet) => {
      expect(styles).toContain(`../browser-extension/${sheet}`);
    });
  });

  it('uses only defined variables and no literal hex colours in kit styles', () => {
    const sources = [...KIT_STYLES, ...GENERATED_STYLES].map(readDesign).concat(read('browser-extension/theme.css'), read('browser-extension/popup.css'));
    const defined = new Set(sources.flatMap((css) => [...stripCss(css).matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])));

    KIT_STYLES.forEach((file) => {
      const css = stripCss(readDesign(file));
      const missing = [...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]).filter((name) => !defined.has(name));

      expect({ file, missing }).toEqual({ file, missing: [] });
      expect({ file, hex: css.match(/#[0-9a-fA-F]{3,8}\b/g) }).toEqual({ file, hex: null });
    });
  });

  it('keeps kit pages free of inline styles and inline scripts', () => {
    PAGES.forEach((page) => {
      const html = readDesign(page);

      expect({ page, style: /\sstyle="/.test(html) }).toEqual({ page, style: false });
      expect({ page, script: /<script(?![^>]*\ssrc=)/.test(html) }).toEqual({ page, script: false });
    });
  });

  it('shows every palette colour on the system page', () => {
    const tokens = readDesign('mobile-tokens.css');
    const light = /:root \{([\s\S]*?)\n\}/.exec(tokens)[1];
    const colours = [...light.matchAll(/--m-([a-z-]+):\s*(#|rgba)/g)].map((match) => `--m-${match[1]}`);
    const html = readDesign('index.html');

    expect(colours.length).toBeGreaterThan(20);
    expect(colours.filter((name) => !html.includes(`data-token="${name}"`))).toEqual([]);
  });

  it('reads the Light and Dark switch through data-theme and guards storage', () => {
    const script = readDesign('kit.js');

    expect(script).toContain('data-kit-theme');
    expect(script).toContain('prefers-color-scheme');
    expect(script).toMatch(/try \{[\s\S]*localStorage\.getItem[\s\S]*\} catch/);
    expect(script).toMatch(/try \{[\s\S]*localStorage\.setItem[\s\S]*\} catch/);
    expect(readDesign('mobile-tokens.css')).toContain(':root[data-theme="dark"]');
    expect(readDesign('extension-tokens.css')).toContain(':root[data-theme="dark"]');
  });

  it('keeps hand-written kit sources free of comments', () => {
    KIT_STYLES.forEach((file) => expect(readDesign(file)).not.toContain('/*'));
    expect(readDesign('kit.js')).not.toMatch(/\/\/|\/\*/);
  });
});

describe('design proposal boards', () => {
  const html = readDesign('proposals.html');
  const markers = html.match(/<article class="kit-board"/g) ?? [];
  const boards = [...html.matchAll(/<article class="kit-board" data-review="([A-Z0-9.-]+)"/g)].map((match) => match[1]);
  const roadmap = read('ROADMAP.md');
  const uiMeta = roadmap.match(/^ {2}`ui · /gm) ?? [];
  const uiIds = [...roadmap.matchAll(/^- \*\*([A-Z][A-Z0-9.-]+)\*\* — .*\n {2}`ui · /gm)].map((match) => match[1]);

  it('parses every board marker it finds and shows an empty state only without boards', () => {
    expect(boards).toHaveLength(markers.length);
    expect(html.match(/data-review="/g) ?? []).toHaveLength(markers.length);
    expect(html.includes('class="kit-empty"')).toBe(markers.length === 0);
    expect(html).toContain(`<h2>Boards <span>${markers.length}</span></h2>`);
  });

  it('parses every ui task of the roadmap', () => {
    expect(uiIds).toHaveLength(uiMeta.length);
  });

  it('draws a board for every ui task', () => {
    uiIds.forEach((id) => expect({ id, board: boards.includes(id) }).toEqual({ id, board: true }));
  });

  it('keeps boards out of the roadmap unless they are approved ui tasks', () => {
    const roadmapIds = [...roadmap.matchAll(/^- \*\*([A-Z][A-Z0-9.-]+)\*\* — /gm)].map((match) => match[1]);

    boards.filter((id) => roadmapIds.includes(id)).forEach((id) => expect({ id, ui: uiIds.includes(id) }).toEqual({ id, ui: true }));
  });

  it('draws each board once, with Now, Proposed and Accept', () => {
    expect(new Set(boards).size).toBe(boards.length);
    expect(html.match(/<p class="kit-board-label">Now<\/p>/g) ?? []).toHaveLength(boards.length);
    expect(html.match(/<p class="kit-board-label">Accept<\/p>/g) ?? []).toHaveLength(boards.length);
  });

  it('has no ROADMAP mirror on the page', () => {
    expect(html).not.toMatch(/kit-task|kit-count|id="(?:queue|progress|creator|proposed)"/);
  });
});

describe('design pages roadmap parser', () => {
  const validate = (markdown) => run('--validate', withRoadmap(markdown));
  const UI = (id) => `- **${id}** — A visual change\n  \`ui · agent · normal\`\n  accept: the board\n`;

  it('accepts empty lanes, grouped tasks and dependencies', () => {
    const creator = `### Group\n\n${TASK('TASK-ONE')}\n${TASK('TASK-TWO', 'TASK-ONE')}`;
    const result = validate(LANES('_None._', '_None._', creator));

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('creator 2');
  });

  it('rejects a ui task without a board', () => {
    const { status, stderr } = validate(LANES(UI('UI-NO-BOARD')));

    expect(status).toBe(1);
    expect(stderr).toContain('ui task UI-NO-BOARD has no board');
  });

  it('rejects a ui task left in Proposed', () => {
    const { status, stderr } = validate(LANES('_None._', '_None._', '_None._', UI('UI-IDEA')));

    expect(status).toBe(1);
    expect(stderr).toContain('ui task in Proposed');
  });

  it('rejects a board that is also a behavioural task', () => {
    const board = read('design/src/proposals.mjs').match(/^ {4}id: '([A-Z0-9.-]+)'/m)[1];
    const { status, stderr } = validate(LANES('_None._', '_None._', '_None._', TASK(board)));

    expect(status).toBe(1);
    expect(stderr).toContain(`board ${board} is also a chore task`);
  });

  it('accepts the repository roadmap', () => {
    expect(run('--validate', path.join(ROOT, 'ROADMAP.md')).status).toBe(0);
  });

  it.each([
    ['a missing lane', '# Roadmap\n\n## Queue\n\n_None._\n', 'missing lane'],
    ['an empty lane', LANES('\n'), 'is empty'],
    ['a stray line', LANES('some prose\n'), 'unexpected line'],
    ['none beside a task', LANES(`_None._\n\n${TASK()}`), '_None._'],
    ['a task without accept', LANES(`- **TASK-ONE** — Title\n  \`chore · agent · low\`\n`), 'no accept'],
    ['a task without a meta line', LANES(`- **TASK-ONE** — Title\n  accept: x\n`), 'type · owner · priority'],
    ['an unknown type', LANES(`- **TASK-ONE** — Title\n  \`epic · agent · low\`\n  accept: x\n`), 'type "epic"'],
    ['an unknown owner', LANES(`- **TASK-ONE** — Title\n  \`chore · robot · low\`\n  accept: x\n`), 'owner "robot"'],
    ['an unknown priority', LANES(`- **TASK-ONE** — Title\n  \`chore · agent · urgent\`\n  accept: x\n`), 'priority "urgent"'],
    ['a duplicate id', LANES(TASK('TASK-ONE'), '_None._', TASK('TASK-ONE')), 'duplicate task id'],
    ['a dangling dependency', LANES(TASK('TASK-ONE', 'TASK-GONE')), 'TASK-GONE'],
    ['a self dependency', LANES(TASK('TASK-ONE', 'TASK-ONE')), 'depends on itself'],
    ['two tasks in progress', LANES('_None._', `${TASK('TASK-ONE')}\n${TASK('TASK-TWO')}`), 'at most one'],
    ['an unbalanced backtick', LANES(`- **TASK-ONE** — Title \`x\n  \`chore · agent · low\`\n  accept: x\n`), 'unbalanced backtick'],
    ['a malformed id', LANES(`- **lowercase** — Title\n`), 'unexpected line'],
  ])('rejects %s', (_, markdown, message) => {
    const { status, stderr } = validate(markdown);

    expect(status).toBe(1);
    expect(stderr).toContain(message);
  });
});
