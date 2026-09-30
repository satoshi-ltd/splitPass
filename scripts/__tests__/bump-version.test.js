import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRIPT = path.join(__dirname, '..', 'bump-version.mjs');

const fixture = ({ changelog = '# Changelog\n\n## Unreleased\n\n- Something.\n' } = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'splitpass-bump-'));
  const write = (file, text) => fs.writeFileSync(path.join(root, file), text);
  write('package.json', '{\n  "version": "1.4.15"\n}\n');
  write(
    'app.json',
    '{\n  "expo": {\n    "version": "1.4.15",\n    "ios": { "buildNumber": "12" },\n    "android": { "versionCode": 12 }\n  }\n}\n',
  );
  write('README.md', '**v1.4.15 · Expo SDK 55.**\n');
  write('SPEC.md', '## Current state\n\n- **1.4.15.** Same version.\n');
  if (changelog !== null) write('CHANGELOG.md', changelog);
  return root;
};

const run = (root, ...args) =>
  spawnSync(process.execPath, [SCRIPT, '--root', root, '--date', '2026-10-01', ...args], { encoding: 'utf8' });
const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('bump-version', () => {
  it('bumps the patch by default in every manifest and banner', () => {
    const root = fixture();
    const { status, stdout } = run(root);

    expect(status).toBe(0);
    expect(stdout).toContain('1.4.15 → 1.4.16');
    expect(read(root, 'package.json')).toContain('"version": "1.4.16"');
    expect(read(root, 'app.json')).toContain('"version": "1.4.16"');
    expect(read(root, 'README.md')).toContain('**v1.4.16 ·');
    expect(read(root, 'SPEC.md')).toContain('- **1.4.16.**');
  });

  it('bumps minor and major only when asked, and accepts an explicit version', () => {
    expect(run(fixture(), 'minor').stdout).toContain('→ 1.5.0');
    expect(run(fixture(), 'major').stdout).toContain('→ 2.0.0');
    expect(run(fixture(), '3.1.4').stdout).toContain('→ 3.1.4');
    expect(run(fixture(), '3.1').status).toBe(1);
  });

  it('leaves build numbers alone unless asked, then moves both together', () => {
    const plain = fixture();
    run(plain);
    expect(read(plain, 'app.json')).toContain('"versionCode": 12');

    const built = fixture();
    run(built, '--build');
    expect(read(built, 'app.json')).toContain('"versionCode": 13');
    expect(read(built, 'app.json')).toContain('"buildNumber": "13"');
  });

  it('dates the Unreleased changelog section, or asks for an entry when there is none', () => {
    const staged = fixture();
    run(staged);
    expect(read(staged, 'CHANGELOG.md')).toContain('## 1.4.16 — 2026-10-01');
    expect(read(staged, 'CHANGELOG.md')).not.toContain('Unreleased');

    expect(run(fixture({ changelog: '# Changelog\n' })).stdout).toContain('Add "## 1.4.16');
  });

  it('refuses a manifest that does not hold the current version and writes nothing', () => {
    const root = fixture();
    fs.writeFileSync(path.join(root, 'README.md'), '**v9.9.9 ·**\n');
    const { status, stderr } = run(root);

    expect(status).toBe(1);
    expect(stderr).toContain('README.md');
    expect(read(root, 'package.json')).toContain('"version": "1.4.15"');
  });
});
