import { bip39 } from '../repositories/bip39';

import { pinToMnemonic } from '../pinToMnemonic';

describe('pinToMnemonic', () => {
  it('returns a two-word string for a valid 6-digit PIN', () => {
    const result = pinToMnemonic('123456');
    expect(typeof result).toBe('string');
    const words = result.split(' ');
    expect(words).toHaveLength(2);
  });

  it('both words are valid BIP39 words', () => {
    const result = pinToMnemonic('123456');
    const [word1, word2] = result.split(' ');
    expect(bip39).toContain(word1);
    expect(bip39).toContain(word2);
  });

  it('is deterministic — same PIN always returns the same mnemonic', () => {
    expect(pinToMnemonic('000000')).toBe(pinToMnemonic('000000'));
    expect(pinToMnemonic('999999')).toBe(pinToMnemonic('999999'));
    expect(pinToMnemonic('123456')).toBe(pinToMnemonic('123456'));
  });

  it('different PINs return different mnemonics', () => {
    expect(pinToMnemonic('000000')).not.toBe(pinToMnemonic('111111'));
  });

  it('returns undefined for a 5-digit PIN', () => {
    expect(pinToMnemonic('12345')).toBeUndefined();
  });

  it('returns undefined for a 7-digit PIN', () => {
    expect(pinToMnemonic('1234567')).toBeUndefined();
  });

  it('returns undefined for a PIN with non-digit characters', () => {
    expect(pinToMnemonic('12345a')).toBeUndefined();
  });

  it('accepts a numeric argument by converting it to string', () => {
    const result = pinToMnemonic(123456);
    expect(typeof result).toBe('string');
    expect(result.split(' ')).toHaveLength(2);
  });

  it('works for the all-zeros PIN', () => {
    const result = pinToMnemonic('000000');
    expect(result.split(' ')).toHaveLength(2);
  });

  it('works for the all-nines PIN', () => {
    const result = pinToMnemonic('999999');
    expect(result.split(' ')).toHaveLength(2);
  });
});
