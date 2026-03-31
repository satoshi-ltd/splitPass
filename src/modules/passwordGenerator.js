const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';

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

export { clampConfig, generatePassword, getPasswordStrength };
