import { SECRET_TYPE } from '../App.constants';
import { QRParser } from './QRParser';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';
const NON_PASSWORD_STRONG_TYPES = [
  SECRET_TYPE.PASSWORD_SHARD,
  SECRET_TYPE.SEED_PHRASE,
  SECRET_TYPE.SEED_PHRASE_SECURE,
  SECRET_TYPE.SEED_PHRASE_SHARD,
  SECRET_TYPE.CARD,
  SECRET_TYPE.CARD_SECURE,
  SECRET_TYPE.CARD_SHARD,
  SECRET_TYPE.TOTP,
];

const countCharacterCategories = (value = '') =>
  [/[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9\s]/.test(value)].filter(Boolean).length;

const getTextStrength = (value = '') => {
  const normalizedValue = `${value}`;
  const length = normalizedValue.length;
  const categories = countCharacterCategories(normalizedValue);
  let score = 0;

  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;

  if (categories >= 2) score += 1;
  if (categories >= 3) score += 1;
  if (categories === 4) score += 1;

  if (/[a-z]/.test(normalizedValue) && /[A-Z]/.test(normalizedValue)) score += 1;
  if (/\d/.test(normalizedValue) && /[^A-Za-z0-9\s]/.test(normalizedValue)) score += 1;

  if (length < 8) return 'weak';
  if (length < 10 && categories < 4) return 'weak';
  if (length < 12 && categories < 3) return 'weak';

  return score >= 6 ? 'strong' : 'weak';
};

const getPassphraseStrength = (value = '') => {
  const normalized = `${value}`;
  const length = normalized.length;

  if (length < 8) return 'weak';

  const words = normalized.trim().split(/\s+/).filter(Boolean).length;
  const categories = countCharacterCategories(normalized);

  if (words >= 4 || length >= 20) return 'strong';
  if ((words >= 3 && length >= 12) || (length >= 16 && categories >= 2)) return 'strong';
  if (length >= 12 || (length >= 10 && categories >= 3)) return 'medium';

  return 'weak';
};

const getSecretStrength = ({ value = '' } = {}) => {
  const [type, ...digits] = `${value}`;
  const encodedLength = digits.join('').length;

  if (!type) return 'weak';
  if (NON_PASSWORD_STRONG_TYPES.includes(type)) return 'strong';

  if (type === SECRET_TYPE.PASSWORD) return getTextStrength(QRParser.decode(value) || '');
  if (type === SECRET_TYPE.PASSWORD_SECURE) return encodedLength >= 20 ? 'strong' : 'weak';

  return 'weak';
};

const getCrypto = () => {
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto;
  return undefined;
};

const getRandomIndex = (length) => {
  const crypto = getCrypto();

  if (crypto) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    return bytes[0] % length;
  }

  return Math.floor(Math.random() * length);
};

const getRandomChar = (pool = '') => pool[getRandomIndex(pool.length)];

const shuffle = (items = []) => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = getRandomIndex(index + 1);
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
};

const clampConfig = ({ capitals = 0, digits = 0, length = 14, symbols = 0 } = {}) => {
  const safeLength = Math.max(8, length);
  const safeDigits = Math.max(0, digits);
  const safeCapitals = Math.max(0, capitals);
  const safeSymbols = Math.max(0, symbols);
  const specialTotal = safeDigits + safeCapitals + safeSymbols;

  return {
    capitals: safeCapitals,
    digits: safeDigits,
    length: Math.max(safeLength, specialTotal),
    symbols: safeSymbols,
  };
};

const generatePassword = (input = {}) => {
  const config = clampConfig(input);
  const lowercaseCount = Math.max(0, config.length - (config.digits + config.capitals + config.symbols));
  const output = [];

  for (let index = 0; index < lowercaseCount; index += 1) output.push(getRandomChar(LOWERCASE));
  for (let index = 0; index < config.capitals; index += 1) output.push(getRandomChar(UPPERCASE));
  for (let index = 0; index < config.digits; index += 1) output.push(getRandomChar(DIGITS));
  for (let index = 0; index < config.symbols; index += 1) output.push(getRandomChar(SYMBOLS));

  return shuffle(output).join('');
};

const getPasswordStrength = (input = {}) => {
  const config = clampConfig(input);
  const lowercase = Math.max(0, config.length - (config.digits + config.capitals + config.symbols));
  const categories = [lowercase > 0, config.capitals > 0, config.digits > 0, config.symbols > 0].filter(Boolean).length;
  const dominant = Math.max(lowercase, config.capitals, config.digits, config.symbols);
  let score = 0;

  if (config.length >= 10) score += 1;
  if (config.length >= 14) score += 1;
  if (config.length >= 18) score += 1;

  if (categories >= 2) score += 1;
  if (categories >= 3) score += 1;
  if (categories === 4) score += 1;

  if (config.symbols > 0) score += 1;
  if (config.digits > 0) score += 1;

  if (dominant >= config.length - 1) score -= 2;
  else if (dominant > Math.ceil(config.length * 0.7)) score -= 1;

  if (config.length < 10 && categories < 3) return 'weak';
  if (score >= 7) return 'veryStrong';
  if (score >= 4) return 'strong';
  return 'weak';
};

export {
  clampConfig,
  generatePassword,
  getPassphraseStrength,
  getPasswordStrength,
  getSecretStrength,
  getTextStrength,
};
