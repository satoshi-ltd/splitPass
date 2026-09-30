import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const manifests = [
  ['package.json', '"version": "{version}"', 1],
  ['app.json', '"version": "{version}"', 1],
  ['README.md', '**v{version} ·', 1],
  ['SPEC.md', '- **{version}.**', 1],
];

const VERSION = /^\d+\.\d+\.\d+$/;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const next = (from, target = 'patch') => {
  const [major, minor, patch] = from.split('.').map(Number);
  if (target === 'patch') return `${major}.${minor}.${patch + 1}`;
  if (target === 'minor') return `${major}.${minor + 1}.0`;
  if (target === 'major') return `${major + 1}.0.0`;
  if (!VERSION.test(target)) throw new Error(`Invalid version ${target}`);
  return target;
};

export const bump = (root, target, { build = false, date = new Date().toISOString().slice(0, 10) } = {}) => {
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  const from = JSON.parse(read('package.json')).version;
  const to = next(from, target);
  const edits = new Map();

  for (const [file, template, expected] of manifests) {
    if (!fs.existsSync(path.join(root, file))) continue;
    const before = template.split('{version}').join(from);
    const after = template.split('{version}').join(to);
    const text = edits.get(file) ?? read(file);
    const found = text.split(before).length - 1;
    if (found < expected) throw new Error(`${file}: expected ${expected} × ${JSON.stringify(before)}, found ${found}`);
    edits.set(file, text.replace(new RegExp(escape(before)), () => after));
  }

  if (build) {
    const { expo } = JSON.parse(edits.get('app.json'));
    const number = Number(expo.android.versionCode) + 1;
    const app = edits
      .get('app.json')
      .replace(/("versionCode":\s*)\d+/, `$1${number}`)
      .replace(/("buildNumber":\s*)"\d+"/, `$1"${number}"`);
    edits.set('app.json', app);
  }

  const changelog = fs.existsSync(path.join(root, 'CHANGELOG.md')) ? read('CHANGELOG.md') : null;
  const staged = changelog !== null && changelog.includes('## Unreleased');
  if (staged) edits.set('CHANGELOG.md', changelog.replace('## Unreleased', `## ${to} — ${date}`));

  for (const [file, text] of edits) fs.writeFileSync(path.join(root, file), text);
  return { from, to, staged };
};

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const option = (name) => {
    const at = args.indexOf(name);
    return at === -1 ? undefined : args[at + 1];
  };
  const root = path.resolve(option('--root') ?? repository);
  const target = args.find((arg, at) => !arg.startsWith('--') && !['--root', '--date'].includes(args[at - 1]));
  try {
    const { from, to, staged } = bump(root, target, { build: args.includes('--build'), date: option('--date') });
    if (root === repository) {
      spawnSync(process.execPath, [path.join(repository, 'scripts', 'design-pages.mjs')], { stdio: 'inherit' });
    }
    console.log(
      `${from} → ${to}.${staged ? '' : ` Add "## ${to} — ${new Date().toISOString().slice(0, 10)}" to CHANGELOG.md.`} Then run node scripts/check-release.mjs.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
