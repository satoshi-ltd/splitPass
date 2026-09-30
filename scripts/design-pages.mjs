import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { REVIEW } from './design-review.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.join(ROOT, 'design');

const PAGES = [
  { file: 'index.html', label: 'System' },
  { file: 'browser-extension.html', label: 'Browser extension' },
  { file: 'mobile.html', label: 'Mobile' },
  { file: 'open-work.html', label: 'Open work' },
  { file: 'proposals.html', label: 'Proposals' },
];
const GENERATED = ['open-work.html', 'proposals.html'];

const LANES = [
  { key: 'queue', title: 'Queue', lead: 'Approved agent tasks, in order. Only the creator moves a task here.', empty: 'Nothing queued. The creator moves a task here to approve it.' },
  { key: 'progress', title: 'In progress', lead: 'The task being worked on. At most one.', empty: 'Nothing in progress.' },
  { key: 'creator', title: 'Needs creator', lead: 'Verify, deploy and decision tasks, and agent work waiting on one of them.', empty: 'Nothing waits on the creator.' },
  { key: 'proposed', title: 'Proposed', lead: 'Ideas that are not approved and have never been worked on.', empty: 'No proposals.' },
];
const LANE_HEADINGS = { Queue: 'queue', 'In progress': 'progress', 'Needs creator': 'creator', Proposed: 'proposed' };
const TYPES = ['bug', 'feature', 'chore', 'verify', 'deploy', 'decision'];
const OWNERS = ['agent', 'creator'];
const PRIORITIES = ['high', 'normal', 'low'];

const ID_PATTERN = '[A-Z][A-Z0-9]*(?:-[A-Z0-9][A-Z0-9.]*)+';
const ENTRY_LINE = new RegExp(`^- \\*\\*(${ID_PATTERN})\\*\\* — (\\S.*)$`);
const META_LINE = new RegExp(`^ {2}\`([a-z]+) · ([a-z]+) · ([a-z]+)(?: · depends: (${ID_PATTERN}(?:, ${ID_PATTERN})*))?\`$`);
const ACCEPT_LINE = /^ {2}accept: (\S.*)$/;
const CONTINUATION_LINE = /^ {2}(\S.*)$/;

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
      entry = { id: start[1], title: start[2], line: number, depends: [], type: '', owner: '', priority: '', accept: '' };
      ids.set(entry.id, { line: number, lane });
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

  const updated = /^Updated (\d{4}-\d{2}-\d{2})/m.exec(markdown);
  return { updated: updated ? updated[1] : '', lanes, ids };
};

const inline = (value, where) => {
  const parts = String(value).split('`');
  if (parts.length % 2 === 0) throw new Error(`${where}: unbalanced backtick in ${JSON.stringify(value)}`);
  return parts.map((part, index) => (index % 2 ? `<code>${esc(part)}</code>` : esc(part))).join('');
};

const sortByPriority = (tasks) =>
  tasks
    .map((task, position) => ({ task, position }))
    .sort((a, b) => PRIORITIES.indexOf(a.task.priority) - PRIORITIES.indexOf(b.task.priority) || a.position - b.position)
    .map(({ task }) => task);

const renderTask = (task, roadmap, page) => {
  const link = (id) => {
    const target = roadmap.ids.get(id).lane === roadmap.lanes.proposed ? 'proposals.html' : 'open-work.html';
    return `<a href="${target === page ? '' : target}#task-${id}">${id}</a>`;
  };
  const depends = task.depends.length ? `<dt>depends</dt><dd>${task.depends.map(link).join(', ')}</dd>` : '';
  return [
    `<li class="kit-task" id="task-${task.id}">`,
    `<div class="kit-task-head"><span class="kit-task-id">${task.id}</span><span class="kit-task-title">${inline(task.title, task.id)}</span></div>`,
    `<div class="kit-task-pills"><span class="kit-pill" data-kind="${task.type}">${task.type}</span><span class="kit-pill" data-owner="${task.owner}">${task.owner}</span><span class="kit-pill" data-priority="${task.priority}">${task.priority}</span></div>`,
    `<dl>${depends}<dt>accept</dt><dd>${inline(task.accept, task.id)}</dd></dl>`,
    '</li>',
  ].join('\n');
};

const renderLane = (meta, lane, roadmap, page, number) => {
  const total = lane.groups.reduce((sum, { tasks }) => sum + tasks.length, 0);
  const body = lane.none
    ? `<p class="kit-empty">${esc(meta.empty)}</p>`
    : lane.groups
        .map(
          (group) =>
            `<div class="kit-group">${group.title ? `<h3>${esc(group.title)}</h3>` : ''}<ul class="kit-tasks">\n${sortByPriority(group.tasks)
              .map((task) => renderTask(task, roadmap, page))
              .join('\n')}\n</ul></div>`,
        )
        .join('\n');
  return `<section class="kit-section" id="${meta.key}"><h2>${meta.title} <span>${String(number).padStart(2, '0')} · ${total}</span></h2><p>${esc(meta.lead)}</p>\n${body}\n</section>`;
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
  '<link rel="icon" href="../assets/favicon.png">',
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

const renderBoard = ({ id, area, title, why, now, proposed, proposedLabel = 'Proposed' }) =>
  `<article class="kit-board" data-review="${id}"><p class="kit-board-id">${id} · ${esc(area)} · <a href="#task-${id}">task</a></p><p class="kit-board-title">${esc(title)}</p><p class="kit-note">${esc(why)}</p><div class="kit-board-sides"><div class="kit-board-side"><p class="kit-board-label">Now</p><div class="kit-board-frame">${now}</div></div><div class="kit-board-side"><p class="kit-board-label">${esc(proposedLabel)}</p><div class="kit-board-frame">${proposed}</div></div></div></article>`;

const renderReview = (review) =>
  `<section class="kit-section" id="review"><h2>Design review <span>01 · ${review.length}</span></h2><p>${review.length} findings from reading the screens against the design system, each drawn as it is and as proposed, each filed in ROADMAP with what proves it done.</p>\n<div class="kit-boards">\n${review.map(renderBoard).join('\n')}\n</div>\n</section>`;

export const checkReview = (review, roadmap) => {
  const seen = new Set();
  for (const { id } of review) {
    if (seen.has(id)) throw new Error(`design-review.mjs: board ${id} appears twice`);
    seen.add(id);
    if (!roadmap.ids.has(id)) throw new Error(`design-review.mjs: board ${id} is not a task in ROADMAP.md; remove the board or file the task`);
    if (roadmap.ids.get(id).lane !== roadmap.lanes.proposed) throw new Error(`design-review.mjs: board ${id} is not in the Proposed lane of ROADMAP.md`);
  }
};

export const renderGenerated = (roadmap, version, review = []) => {
  const facts = ['source ROADMAP.md', 'regenerate node scripts/design-pages.mjs'];
  if (roadmap.updated) facts.push(`roadmap updated ${roadmap.updated}`);
  const [queue, progress, creator, proposed] = LANES.map(({ key }) => roadmap.lanes[key]);

  const counts = (items) =>
    `<div class="kit-counts">${items.map(([meta, lane]) => `<a class="kit-count" href="#${meta.key}"><strong>${count(lane)}</strong><span>${meta.title}</span></a>`).join('')}</div>`;

  const open = [
    [LANES[0], queue],
    [LANES[1], progress],
    [LANES[2], creator],
  ];

  return {
    'open-work.html': shell({
      file: 'open-work.html',
      title: 'split/Pass design · Open work',
      description: 'Queue, in progress and creator tasks rendered from ROADMAP.md.',
      intro: {
        title: 'Open work',
        text: 'What is pending: the approved queue, the task in progress and everything waiting on the creator. A task leaves this page when it ships; the changelog keeps the history.',
      },
      facts,
      sections: [counts(open), ...open.map(([meta, lane], index) => renderLane(meta, lane, roadmap, 'open-work.html', index + 1))].join('\n'),
      version,
    }),
    'proposals.html': shell({
      file: 'proposals.html',
      title: 'split/Pass design · Proposals',
      description: 'Proposed tasks rendered from ROADMAP.md.',
      intro: {
        title: 'Proposals',
        text: 'Visual findings first, each drawn as it is and as proposed, then every idea that is not approved and has never been worked on. The creator moves a proposal to the queue to approve it.',
      },
      facts,
      sections: [review.length ? renderReview(review) : '', counts([[LANES[3], proposed]]), renderLane(LANES[3], proposed, roadmap, 'proposals.html', review.length ? 2 : 1)].filter(Boolean).join('\n'),
      version,
      sheets: review.length ? REVIEW_SHEETS : BASE_SHEETS,
    }),
  };
};

const HEADER_BLOCK = /<header class="kit-header">[\s\S]*?<\/header>/;

export const buildPages = () => {
  const { version } = JSON.parse(read('package.json'));
  const roadmap = parseRoadmap(read('ROADMAP.md'));
  checkReview(REVIEW, roadmap);
  const pages = renderGenerated(roadmap, version, REVIEW);

  for (const { file } of PAGES) {
    if (GENERATED.includes(file)) continue;
    const target = path.join(DESIGN, file);
    if (!fs.existsSync(target)) throw new Error(`design/${file} is missing`);
    const current = fs.readFileSync(target, 'utf8');
    if (!HEADER_BLOCK.test(current)) throw new Error(`design/${file} has no <header class="kit-header"> block to stamp`);
    pages[file] = current.replace(HEADER_BLOCK, () => renderHeader(file, version));
  }
  return pages;
};

const validate = (file) => {
  const roadmap = parseRoadmap(fs.readFileSync(path.resolve(file), 'utf8'), path.basename(file));
  renderGenerated(roadmap, '0.0.0');
  const counts = Object.entries(roadmap.lanes).map(([key, lane]) => `${key} ${count(lane)}`);
  console.log(`Roadmap valid: ${counts.join(', ')}`);
};

const main = () => {
  const validateAt = process.argv.indexOf('--validate');
  if (validateAt !== -1) return validate(process.argv[validateAt + 1] ?? 'ROADMAP.md');
  const check = process.argv.includes('--check');
  const pages = buildPages();
  const stale = [];

  for (const [file, html] of Object.entries(pages)) {
    const target = path.join(DESIGN, file);
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    if (current === html) continue;
    if (check) stale.push(file);
    else fs.writeFileSync(target, html);
  }

  if (check && stale.length) {
    console.error(`design/${stale.join(', design/')} out of date: run node scripts/design-pages.mjs`);
    process.exit(1);
  }
  if (!check) console.log(`Wrote ${Object.keys(pages).map((file) => `design/${file}`).join(', ')}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
