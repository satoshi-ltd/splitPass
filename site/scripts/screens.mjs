import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const kit = path.join(root, 'design');
const output = path.join(root, 'site/assets/screens');

export const SCREENS = [
  { file: 'vault', section: 'home', text: /^9:41 split\/ Pass You have 9 secrets/ },
  { file: 'shard', section: 'viewer', text: /^9:41 Seed 12 Shard 1$/ },
  { file: 'recovered', section: 'scanner', text: /^9:41 Scanner QR NFC Recovered secret ready \*+$/ },
  { file: 'totp', section: 'viewer', text: /^9:41 Google 2FA satoshi@gmail\.com Never opened 542389 14/ },
  { file: 'generator', section: 'generator', text: /^9:41 Very strong Password generator/ },
  { file: 'settings', section: 'settings', text: /^9:41 Settings Backup, language, and local security\. Security/ },
];

const plain = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const phones = (html) => {
  const sections = [...html.matchAll(/<section class="kit-section" id="([a-z-]+)"/g)].map((m) => [m.index, m[1]]);
  return [...html.matchAll(/<div class="m-phone/g)].map(({ index }) => {
    let depth = 0;
    let end = index;
    for (const tag of html.slice(index).matchAll(/<div\b|<\/div>/g)) {
      depth += tag[0] === '</div>' ? -1 : 1;
      if (depth === 0) {
        end = index + tag.index + tag[0].length;
        break;
      }
    }
    const section = sections.filter(([at]) => at < index).at(-1)?.[1];
    return { section, markup: html.slice(index, end), text: plain(html.slice(index, end)) };
  });
};

export const pick = (html, { section, text }) => {
  const found = phones(html).find((phone) => phone.section === section && text.test(phone.text));
  if (!found) throw new Error(`No ${section} screen matches ${text}`);
  return found.markup;
};

const browser = () => {
  const candidates = [
    process.env.BROWSER,
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  const found = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!found) throw new Error('Set BROWSER to a Chromium-based browser executable');
  return found;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const kitHtml = readFileSync(path.join(kit, 'mobile.html'), 'utf8');
  const defs = kitHtml.match(/<svg class="kit-svg-defs"[\s\S]*?<\/svg>/)[0];
  const scratch = mkdtempSync(path.join(os.tmpdir(), 'splitpass-screens-'));
  mkdirSync(output, { recursive: true });
  for (const screen of SCREENS) {
    const page = path.join(scratch, `${screen.file}.html`);
    writeFileSync(
      page,
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${pathToFileURL(kit)}/"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Doto:wght@500;700;900&display=swap"><link rel="stylesheet" href="mobile-tokens.css"><link rel="stylesheet" href="mobile-icons.css"><link rel="stylesheet" href="mobile.css"><style>html,body{margin:0;background:#fffbf7}.kit-svg-defs{position:absolute;width:0;height:0}</style></head><body>${defs}${pick(kitHtml, screen)}</body></html>`,
    );
    const target = path.join(output, `${screen.file}.png`);
    const run = spawnSync(
      browser(),
      ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', '--window-size=390,844', '--virtual-time-budget=6000', `--screenshot=${target}`, pathToFileURL(page).href],
      { encoding: 'utf8' },
    );
    if (run.status !== 0) throw new Error(run.stderr);
    console.log(`Wrote ${path.relative(root, target)}`);
  }
}
