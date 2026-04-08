import { bip39 } from './repositories/bip39';

const SEED_PHRASE_LENGTH = [12, 24];
const SEED_WORDS = new Set(bip39);

const isBip39Word = (word = '') => SEED_WORDS.has(word);

export const isSeedPhraseCandidate = (value = '') => {
  const text = `${value}`;
  if (!/\s/.test(text)) return false;

  const [firstWord = ''] = text.trimStart().split(/\s+/);
  return isBip39Word(firstWord);
};

export const isSeedPhrase = (value = '') => {
  const words = Array.isArray(value) ? value : value.trim().split(' ');

  return (
    SEED_PHRASE_LENGTH.includes(words.length) &&
    words.every((word) => [undefined, ''].includes(word) || isBip39Word(word))
  );
};
