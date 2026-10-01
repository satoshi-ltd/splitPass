import fs from 'node:fs';
import path from 'node:path';

import { esc } from './draw.mjs';
import { DESIGN, ROOT, read } from './paths.mjs';
import { REVIEW } from './proposals.mjs';

const PAGES = [
  { file: 'index.html', label: 'System' },
  { file: 'browser-extension.html', label: 'Browser extension' },
  { file: 'mobile.html', label: 'Mobile' },
  { file: 'proposals.html', label: 'Proposals' },
];
const GENERATED = ['proposals.html'];
const FAVICON = { source: 'assets/favicon.png', target: 'favicon.png' };
const FAVICON_LINK = '<link rel="icon" href="favicon.png">';
const FAVICON_LINK_PATTERN = /<link rel="icon" href="[^"]*">/;

const LANES = [
  { key: 'queue', title: 'Queue' },
  { key: 'progress', title: 'In progress' },
  { key: 'creator', title: 'Needs creator' },
  { key: 'proposed', title: 'Proposed' },
];
const LANE_HEADINGS = { Queue: 'queue', 'In progress': 'progress', 'Needs creator': 'creator', Proposed: 'proposed' };
const TYPES = ['bug', 'feature', 'chore', 'ui', 'verify', 'deploy', 'decision'];
const OWNERS = ['agent', 'creator'];
const PRIORITIES = ['high', 'normal', 'low'];

const ID_PATTERN = '[A-Z][A-Z0-9]*(?:-[A-Z0-9][A-Z0-9.]*)+';
const ENTRY_LINE = new RegExp(`^- \\*\\*(${ID_PATTERN})\\*\\* — (\\S.*)$`);
const META_LINE = new RegExp(`^ {2}\`([a-z]+) · ([a-z]+) · ([a-z]+)(?: · depends: (${ID_PATTERN}(?:, ${ID_PATTERN})*))?\`$`);
const ACCEPT_LINE = /^ {2}accept: (\S.*)$/;
const CONTINUATION_LINE = /^ {2}(\S.*)$/;

export const parseRoadmap = (markdown, file = 'ROADMAP.md') => {
  const fail = (line, message) => {
    throw new Error(`${file}:${line}: ${message}`);
  };
  const lanes = Object.fromEntries(LANES.map(({ key }) => [key, { seen: false, none: false, groups: [] }]));
  const ids = new Map();
  const dependencies = [];
  let lane = null;
  let group = null;
  let entry = null;

  const closeEntry = () => {
    if (!entry) return;
    if (!entry.type) fail(entry.line, `${entry.id} has no \`type · owner · priority\` line`);
    if (!entry.accept) fail(entry.line, `${entry.id} has no accept: line`);
    inline(entry.title, entry.id);
    inline(entry.accept, entry.id);
    entry = null;
  };

  const lines = markdown.split('\n');
  lines.forEach((text, index) => {
    const number = index + 1;
    const line = text.replace(/\s+$/, '');
    const heading = /^## (.+)$/.exec(line);

    if (heading) {
      closeEntry();
      lane = LANE_HEADINGS[heading[1]] ? lanes[LANE_HEADINGS[heading[1]]] : null;
      group = null;
      if (lane) {
        if (lane.seen) fail(number, `lane "${heading[1]}" appears twice`);
        lane.seen = true;
      }
      return;
    }
    if (!lane) return;

    if (line === '') {
      closeEntry();
      return;
    }

    if (line === '_None._') {
      if (lane.groups.length) fail(number, '"_None._" cannot share a lane with tasks');
      lane.none = true;
      return;
    }

    const groupHeading = /^### (\S.*)$/.exec(line);
    if (groupHeading) {
      closeEntry();
      if (lane.none) fail(number, '"_None._" cannot share a lane with tasks');
      group = { title: groupHeading[1], tasks: [] };
      lane.groups.push(group);
      return;
    }

    const start = ENTRY_LINE.exec(line);
    if (start) {
      closeEntry();
      if (lane.none) fail(number, '"_None._" cannot share a lane with tasks');
      if (ids.has(start[1])) fail(number, `duplicate task id ${start[1]} (first at line ${ids.get(start[1]).line})`);
      if (!group) {
        group = { title: '', tasks: [] };
        lane.groups.push(group);
      }
      entry = { id: start[1], title: start[2], line: number, depends: [], type: '', owner: '', priority: '', accept: '', lane };
      ids.set(entry.id, entry);
      group.tasks.push(entry);
      return;
    }

    if (!entry) fail(number, `unexpected line outside a task: ${JSON.stringify(line)}`);

    if (!entry.type) {
      const meta = META_LINE.exec(line);
      if (!meta) fail(number, `${entry.id}: expected \`type · owner · priority\` on the line after the title`);
      const [, type, owner, priority, depends] = meta;
      if (!TYPES.includes(type)) fail(number, `${entry.id}: type "${type}" is not one of ${TYPES.join(', ')}`);
      if (!OWNERS.includes(owner)) fail(number, `${entry.id}: owner "${owner}" is not one of ${OWNERS.join(', ')}`);
      if (!PRIORITIES.includes(priority)) fail(number, `${entry.id}: priority "${priority}" is not one of ${PRIORITIES.join(', ')}`);
      Object.assign(entry, { type, owner, priority });
      if (depends) {
        entry.depends = depends.split(', ');
        entry.depends.forEach((dependency) => dependencies.push({ id: entry.id, dependency, line: number }));
      }
      return;
    }

    const accept = ACCEPT_LINE.exec(line);
    if (accept && !entry.accept) {
      entry.accept = accept[1];
      return;
    }

    const continuation = CONTINUATION_LINE.exec(line);
    if (continuation && entry.accept) {
      entry.accept = `${entry.accept} ${continuation[1]}`;
      return;
    }

    fail(number, `${entry.id}: unexpected line ${JSON.stringify(line)}`);
  });
  closeEntry();

  for (const { key, title } of LANES) {
    const found = lanes[key];
    if (!found.seen) throw new Error(`${file}: missing lane "## ${title}"`);
    if (!found.none && !found.groups.length) throw new Error(`${file}: lane "${title}" is empty; write _None._`);
  }
  if (lanes.progress.groups.reduce((total, { tasks }) => total + tasks.length, 0) > 1) {
    throw new Error(`${file}: "In progress" holds at most one task`);
  }
  for (const { id, dependency, line } of dependencies) {
    if (dependency === id) throw new Error(`${file}:${line}: ${id} depends on itself`);
    if (!ids.has(dependency)) throw new Error(`${file}:${line}: ${id} depends on ${dependency}, which is not in the roadmap`);
  }

  return { lanes, ids };
};

const inline = (value, where) => {
  const parts = String(value).split('`');
  if (parts.length % 2 === 0) throw new Error(`${where}: unbalanced backtick in ${JSON.stringify(value)}`);
  return parts.map((part, index) => (index % 2 ? `<code>${esc(part)}</code>` : esc(part))).join('');
};

const count = (lane) => lane.groups.reduce((sum, { tasks }) => sum + tasks.length, 0);

const sheet = (href) => `<link rel="stylesheet" href="${href}">`;

const BASE_SHEETS = ['mobile-tokens.css'];
const REVIEW_SHEETS = [
  '../browser-extension/theme.css',
  '../browser-extension/item.css',
  '../browser-extension/scanner-ui.css',
  '../browser-extension/popup.css',
  'mobile-tokens.css',
  'extension-tokens.css',
  'mobile-icons.css',
  'mobile.css',
];

const headAssets = (sheets) => [
  FAVICON_LINK,
  sheet('https://fonts.googleapis.com/css2?family=Doto:wght@500;700;900&display=swap'),
  ...sheets.map(sheet),
  sheet('kit.css'),
  '<script src="kit.js"></script>',
];

export const renderHeader = (active, version) => {
  const links = PAGES.map(({ file, label }) => `<a href="${file}"${file === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return [
    '<header class="kit-header">',
    '<a class="kit-brand" href="index.html"><img src="../assets/icon.png" alt=""><span>split<b>/</b>Pass</span></a>',
    `<nav class="kit-nav" aria-label="Design kit">${links}</nav>`,
    `<span class="kit-version">v${esc(version)} · production</span>`,
    '<div class="kit-theme" role="group" aria-label="Theme"><button type="button" data-kit-theme="light">Light</button><button type="button" data-kit-theme="dark">Dark</button></div>',
    '</header>',
  ].join('\n');
};

const shell = ({ file, title, description, intro, facts, sections, version, sheets = BASE_SHEETS }) =>
  [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    ...headAssets(sheets),
    '</head>',
    '<body class="kit">',
    renderHeader(file, version),
    '<main class="kit-main">',
    `<section class="kit-intro"><h1>${esc(intro.title)}</h1><p>${esc(intro.text)}</p><div class="kit-facts">${facts.map((fact) => `<span>${esc(fact)}</span>`).join('')}</div></section>`,
    sections,
    '</main>',
    '</body>',
    '</html>',
    '',
  ].join('\n');

const renderBoard = ({ id, area, title, why, accept, now, proposed, proposedLabel = 'Proposed' }) =>
  `<article class="kit-board" data-review="${id}"><p class="kit-board-id">${id} · ${esc(area)}</p><p class="kit-board-title">${esc(title)}</p><p class="kit-note">${esc(why)}</p><div class="kit-board-sides"><div class="kit-board-side"><p class="kit-board-label">Now</p><div class="kit-board-frame">${now}</div></div><div class="kit-board-side"><p class="kit-board-label">${esc(proposedLabel)}</p><div class="kit-board-frame">${proposed}</div></div></div><p class="kit-board-label">Accept</p><p class="kit-note">${inline(accept, id)}</p></article>`;

const renderBoards = (review) =>
  `<section class="kit-section" id="boards"><h2>Boards <span>${review.length}</span></h2><p>Each proposal is drawn as it is and as proposed, with what proves it done. The creator approves one by queueing it in ROADMAP.md as a \`ui\` task with its ID.</p>\n<div class="kit-boards">\n${review.map(renderBoard).join('\n')}\n</div>\n</section>`;

const renderEmpty = () =>
  '<section class="kit-section" id="boards"><h2>Boards <span>0</span></h2><p class="kit-empty">No proposals. A purely visual idea appears here as a board until the creator approves it or it is dropped.</p></section>';

export const checkBoards = (review, roadmap) => {
  const seen = new Set();
  for (const { id, accept } of review) {
    if (seen.has(id)) throw new Error(`design/src/proposals.mjs: board ${id} appears twice`);
    seen.add(id);
    if (!accept) throw new Error(`design/src/proposals.mjs: board ${id} has no accept text`);
    if (roadmap.ids.has(id) && roadmap.ids.get(id).type !== 'ui') throw new Error(`design/src/proposals.mjs: board ${id} is also a ${roadmap.ids.get(id).type} task in ROADMAP.md; a board is the proposal, remove one`);
  }
  for (const [id, task] of roadmap.ids) {
    if (task.type !== 'ui') continue;
    if (task.lane === roadmap.lanes.proposed) throw new Error(`ROADMAP.md: ${id} is a ui task in Proposed; a visual idea is a board until approved`);
    if (!seen.has(id)) throw new Error(`ROADMAP.md: ui task ${id} has no board in design/src/proposals.mjs`);
  }
};

export const renderGenerated = (version, review = []) => ({
  'proposals.html': shell({
    file: 'proposals.html',
    title: 'split/Pass design · Proposals',
    description: 'Purely visual proposals drawn as they are and as proposed.',
    intro: {
      title: 'Proposals',
      text: 'Purely visual ideas that are not shipped, each drawn as it is and as proposed. A board leaves this page when its change ships; approved ones are queued in ROADMAP.md as ui tasks.',
    },
    facts: ['source design/src/proposals.mjs', 'regenerate node design/build.mjs', `${review.length} boards`],
    sections: review.length ? renderBoards(review) : renderEmpty(),
    version,
    sheets: review.length ? REVIEW_SHEETS : BASE_SHEETS,
  }),
});

const HEADER_BLOCK = /<header class="kit-header">[\s\S]*?<\/header>/;

export const buildPages = () => {
  const { version } = JSON.parse(read('package.json'));
  const roadmap = parseRoadmap(read('ROADMAP.md'));
  checkBoards(REVIEW, roadmap);
  const pages = renderGenerated(version, REVIEW);

  for (const { file } of PAGES) {
    if (GENERATED.includes(file)) continue;
    const target = path.join(DESIGN, file);
    if (!fs.existsSync(target)) throw new Error(`design/${file} is missing`);
    const current = fs.readFileSync(target, 'utf8');
    if (!HEADER_BLOCK.test(current)) throw new Error(`design/${file} has no <header class="kit-header"> block to stamp`);
    if (!FAVICON_LINK_PATTERN.test(current)) throw new Error(`design/${file} has no <link rel="icon"> to point at the copied favicon`);
    pages[file] = current.replace(HEADER_BLOCK, () => renderHeader(file, version)).replace(FAVICON_LINK_PATTERN, () => FAVICON_LINK);
  }
  pages[FAVICON.target] = fs.readFileSync(path.join(ROOT, FAVICON.source));
  return pages;
};

export const validateRoadmap = (file) => {
  const roadmap = parseRoadmap(fs.readFileSync(path.resolve(file), 'utf8'), path.basename(file));
  checkBoards(REVIEW, roadmap);
  const counts = Object.entries(roadmap.lanes).map(([key, lane]) => `${key} ${count(lane)}`);
  return `Roadmap valid: ${counts.join(', ')}`;
};

export const syncPages = ({ check }) => {
  const pages = buildPages();
  const stale = [];

  for (const [file, html] of Object.entries(pages)) {
    const target = path.join(DESIGN, file);
    const current = fs.existsSync(target) ? fs.readFileSync(target) : null;
    if (current && current.equals(Buffer.from(html))) continue;
    if (check) stale.push(file);
    else fs.writeFileSync(target, html);
  }

  return { written: check ? [] : Object.keys(pages), stale };
};
