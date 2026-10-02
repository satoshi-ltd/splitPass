import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRIPT = path.join(__dirname, '..', 'android-build.mjs');
const ROOT = path.join(__dirname, '..', '..');
const fixtures = [];
afterAll(() => fixtures.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

const fixture = (check) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'splitpass-android-build-'));
  fixtures.push(dir);
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.mkdirSync(path.join(dir, 'node_modules/expo'), { recursive: true });
  fs.copyFileSync(SCRIPT, path.join(dir, 'scripts/android-build.mjs'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ scripts: { 'check:release': check } }));
  fs.writeFileSync(
    path.join(dir, 'app.json'),
    JSON.stringify({ expo: { version: '1.2.3', android: { package: 'com.example.demo' } } }),
  );
  return dir;
};
const build = (dir, ...args) =>
  spawnSync(process.execPath, [path.join(dir, 'scripts/android-build.mjs'), ...args], { encoding: 'utf8' });
const withEas = (dir, ...args) => {
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'npx'), `#!/bin/sh\necho "$@" > "${path.join(dir, 'eas-args')}"\n`, { mode: 0o755 });
  return spawnSync(process.execPath, [path.join(dir, 'scripts/android-build.mjs'), ...args], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` },
  });
};

describe('android-build', () => {
  it('is wired as the six build scripts plus check:release', () => {
    const { scripts } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(scripts['build:dev']).toBe('node scripts/android-build.mjs dev');
    expect(scripts['build:prod']).toBe('node scripts/android-build.mjs prod');
    expect(scripts['build:local:dev']).toBe('node scripts/android-build.mjs dev --local');
    expect(scripts['build:local:prod']).toBe('node scripts/android-build.mjs prod --local');
    expect(scripts['build:store']).toBe('node scripts/android-build.mjs store');
    expect(scripts['build:local:store']).toBe('node scripts/android-build.mjs store --local');
    expect(scripts['check:release']).toBe('node scripts/check-release.mjs');
    expect(Object.keys(scripts).filter((key) => /preview/.test(key))).toEqual([]);
  });

  it('keeps release-assets out of git and of the EAS archive', () => {
    expect(spawnSync('git', ['check-ignore', '-q', 'release-assets/x.apk'], { cwd: ROOT }).status).toBe(0);
  });

  it('rejects unknown modes and --install-only outside dev before touching anything', () => {
    const unknown = spawnSync(process.execPath, [SCRIPT, 'preview'], { encoding: 'utf8' });
    expect(unknown.status).toBe(1);
    expect(unknown.stderr).toContain('dev|prod');
    const prod = spawnSync(process.execPath, [SCRIPT, 'prod', '--install-only'], { encoding: 'utf8' });
    expect(prod.status).toBe(1);
    expect(prod.stderr).toContain('--install-only is for dev builds');
  });

  it('stops when check:release fails, before creating release-assets', () => {
    const dir = fixture('exit 3');
    expect(build(dir, 'dev', '--install-only').status).toBe(3);
    expect(fs.existsSync(path.join(dir, 'release-assets'))).toBe(false);
  });

  it('derives the APK name from app.json', () => {
    const dir = fixture('exit 0');
    const result = build(dir, 'dev', '--install-only');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(path.join('release-assets', 'demo-1.2.3-android-dev.apk'));
  });

  it('builds the store profile as an Android App Bundle', () => {
    const { build: profiles } = JSON.parse(fs.readFileSync(path.join(ROOT, 'eas.json'), 'utf8'));
    expect(profiles.store).toEqual({ extends: 'production', android: { buildType: 'app-bundle' } });
    expect(profiles.production.android.buildType).toBe('apk');

    const dir = fixture('exit 0');
    const output = path.join(fs.realpathSync(dir), 'release-assets', 'demo-1.2.3-android.aab');
    const result = withEas(dir, 'store', '--local');
    expect(fs.readFileSync(path.join(dir, 'eas-args'), 'utf8').trim()).toBe(
      `--yes eas-cli build --platform android --profile store --local --output ${output}`,
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`No AAB at ${output}`);
  });
});
