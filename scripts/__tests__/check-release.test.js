import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRIPT = path.join(__dirname, '..', 'check-release.mjs');
const ROOT = path.join(__dirname, '..', '..');

const check = (root) => spawnSync(process.execPath, [SCRIPT, root], { encoding: 'utf8' });

const fixture = ({ version = '1.2.3', appVersion = '1.2.3', versionCode = 7, buildNumber = '7' }) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'splitpass-release-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version }));
  fs.writeFileSync(
    path.join(root, 'app.json'),
    JSON.stringify({ expo: { version: appVersion, android: { versionCode }, ios: { buildNumber } } }),
  );
  return root;
};

describe('check-release', () => {
  it('accepts the repository manifests', () => {
    const { status, stdout } = check(ROOT);

    expect(stdout).toContain('Release manifests agree');
    expect(status).toBe(0);
  });

  it('accepts manifests in agreement', () => {
    const { status } = check(fixture({}));

    expect(status).toBe(0);
  });

  it('rejects a version that is not x.y.z', () => {
    const { status, stderr } = check(fixture({ version: '1.2.3-beta', appVersion: '1.2.3-beta' }));

    expect(stderr).toContain('1.2.3-beta');
    expect(status).toBe(1);
  });

  it('rejects app.json drifting from package.json', () => {
    const { status, stderr } = check(fixture({ appVersion: '1.2.2' }));

    expect(stderr).toContain('app.json is 1.2.2');
    expect(status).toBe(1);
  });

  it('rejects an android versionCode that disagrees with the ios buildNumber', () => {
    const { status, stderr } = check(fixture({ buildNumber: '6' }));

    expect(stderr).toContain('disagree');
    expect(status).toBe(1);
  });

  it('rejects a README banner or changelog left on an older version', () => {
    const banner = fixture({});
    fs.writeFileSync(path.join(banner, 'README.md'), '**v1.2.2 · Expo.**\n');
    expect(check(banner).stderr).toContain('README.md');

    const changelog = fixture({});
    fs.writeFileSync(path.join(changelog, 'CHANGELOG.md'), '## 1.2.2 — 2026-01-01\n');
    const { status, stderr } = check(changelog);
    expect(stderr).toContain('CHANGELOG.md');
    expect(status).toBe(1);
  });
});
