import { syncPages, validateRoadmap } from './src/pages.mjs';
import { syncTokens } from './src/tokens.mjs';

const main = async () => {
  const validateAt = process.argv.indexOf('--validate');
  if (validateAt !== -1) return console.log(validateRoadmap(process.argv[validateAt + 1] ?? 'ROADMAP.md'));

  const check = process.argv.includes('--check');
  const pages = syncPages({ check });
  const tokens = await syncTokens({ check });
  const stale = [...pages.stale, ...tokens.stale];

  if (check && stale.length) {
    console.error(`design/${stale.join(', design/')} out of date: run node design/build.mjs`);
    process.exit(1);
  }
  if (!check) console.log(`Wrote ${[...pages.written, ...tokens.written].map((file) => `design/${file}`).join(', ')}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
