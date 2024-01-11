import { SEED_PHRASE_LENGTH } from './constants';
import { bip39 } from './repositories/bip39';

export const isSeedPhrase = (value = '') => {
  const words = Array.isArray(value) ? value : value.trim().split(' ');

  return (
    SEED_PHRASE_LENGTH.includes(words.length) &&
    words.every((word) => [undefined, ''].includes(word) || bip39.find((item) => item === word))
  );
};
