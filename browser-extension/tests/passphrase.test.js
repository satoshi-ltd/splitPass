require('../lib/passphrase.js');

const { getPassphraseStrength } = globalThis.SplitPassPassphrase;

// Mirrors src/modules/__tests__/passwordStrength.test.js — the two must stay in sync.
describe('getPassphraseStrength (extension)', () => {
  it('rates a multi-word passphrase as strong even with one character category', () => {
    expect(getPassphraseStrength('correct horse battery staple')).toBe('strong');
  });

  it('rates a long random string as strong', () => {
    expect(getPassphraseStrength('dChz3@t6Nd3G#8K$xy')).toBe('strong');
  });

  it('rates borderline 12-char single words as medium', () => {
    expect(getPassphraseStrength('correcthorse')).toBe('medium');
  });

  it('rates short or trivial keys as weak', () => {
    expect(getPassphraseStrength('password')).toBe('weak');
    expect(getPassphraseStrength('short')).toBe('weak');
    expect(getPassphraseStrength('')).toBe('weak');
  });
});
