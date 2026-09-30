import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifests } from './bump-version.mjs';

const root = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const { version } = read('package.json');
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`Expected an x.y.z release version, got ${version}`);

const { expo } = read('app.json');
if (expo.version !== version) fail(`package.json is ${version} but app.json is ${expo.version}`);

const build = String(expo.android.versionCode);
if (build !== String(expo.ios.buildNumber)) {
  fail(`android.versionCode ${build} and ios.buildNumber ${expo.ios.buildNumber} disagree`);
}

for (const [file, template] of manifests.slice(2)) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) continue;
  const expected = template.split('{version}').join(version);
  if (!fs.readFileSync(target, 'utf8').includes(expected)) fail(`${file} does not carry ${JSON.stringify(expected)}`);
}

const changelog = path.join(root, 'CHANGELOG.md');
if (fs.existsSync(changelog) && !fs.readFileSync(changelog, 'utf8').includes(`## ${version} — `)) {
  fail(`CHANGELOG.md has no entry for ${version}`);
}

console.log(`Release manifests agree: v${version}, build ${build}`);
