import { isSeedPhrase, isSeedPhraseCandidate } from '../isSeedPhrase';

const WORDS_12 = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
const WORDS_24 =
  'abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual';

describe('isSeedPhrase', () => {
  it('accepts a valid 12-word BIP39 phrase', () => {
    expect(isSeedPhrase(WORDS_12)).toBe(true);
  });

  it('accepts a valid 24-word BIP39 phrase', () => {
    expect(isSeedPhrase(WORDS_24)).toBe(true);
  });

  it('accepts an array of 12 valid BIP39 words', () => {
    expect(isSeedPhrase(WORDS_12.split(' '))).toBe(true);
  });

  it('rejects a phrase with 11 words', () => {
    const words = WORDS_12.split(' ').slice(0, 11).join(' ');
    expect(isSeedPhrase(words)).toBe(false);
  });

  it('rejects a phrase with 13 words', () => {
    const words = WORDS_12 + ' ability';
    expect(isSeedPhrase(words)).toBe(false);
  });

  it('rejects a phrase containing non-BIP39 words', () => {
    const words = WORDS_12.split(' ');
    words[5] = 'notaword';
    expect(isSeedPhrase(words.join(' '))).toBe(false);
  });

  it('rejects a single word', () => {
    expect(isSeedPhrase('abandon')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isSeedPhrase('')).toBe(false);
  });
});

describe('isSeedPhraseCandidate', () => {
  it('returns true when input starts with a BIP39 word followed by a space', () => {
    expect(isSeedPhraseCandidate('abandon something else')).toBe(true);
  });

  it('returns true for an otherwise valid seed phrase', () => {
    expect(isSeedPhraseCandidate(WORDS_12)).toBe(true);
  });

  it('returns false for a single BIP39 word with no spaces', () => {
    expect(isSeedPhraseCandidate('abandon')).toBe(false);
  });

  it('returns false when the first word is not a BIP39 word', () => {
    expect(isSeedPhraseCandidate('notaword ability able')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isSeedPhraseCandidate('')).toBe(false);
  });

  it('returns false for a plain password that happens to contain spaces', () => {
    expect(isSeedPhraseCandidate('my secret password')).toBe(false);
  });
});
