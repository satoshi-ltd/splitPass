const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..');

const sources = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sources(target);
    return /\.jsx?$/.test(entry.name) ? [fs.readFileSync(target, 'utf8')] : [];
  });

const collect = (pattern) => new Set(sources(SRC).flatMap((text) => [...text.matchAll(pattern)].map((match) => match[1])));

describe('navigation', () => {
  it('only navigates to routes the navigators register', () => {
    const registered = collect(/<(?:Stack|Tab)\.Screen\s+name="([A-Za-z]+)"/g);
    const targets = collect(/navigate\('([A-Za-z]+)'/g);

    expect(registered.size).toBeGreaterThan(5);
    expect([...targets].filter((route) => !registered.has(route))).toEqual([]);
  });
});
