/* global Uint8Array */
import { CryptoDigestAlgorithm, digest } from 'expo-crypto';

const DEFAULT_ALGORITHM = 'SHA1';
const DEFAULT_DIGITS = 6;
const DEFAULT_PERIOD = 30;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_PREFIX = 'otpauth://totp/';

const DIGEST_ALGORITHMS = {
  SHA1: CryptoDigestAlgorithm.SHA1,
  SHA256: CryptoDigestAlgorithm.SHA256,
  SHA512: CryptoDigestAlgorithm.SHA512,
};

const BLOCK_SIZES = {
  SHA1: 64,
  SHA256: 64,
  SHA512: 128,
};

const normalizeSecret = (value = '') => `${value}`.replace(/\s+/g, '').toUpperCase();

const decodePathSegment = (value = '') => {
  try {
    return decodeURIComponent(value);
  } catch {
    return `${value}`;
  }
};

const parseQuery = (value = '') =>
  `${value}`
    .split('&')
    .filter(Boolean)
    .reduce((output, pair) => {
      const [rawKey = '', ...rawValue] = pair.split('=');
      const key = decodePathSegment(rawKey.replace(/\+/g, ' '));
      const nextValue = decodePathSegment(rawValue.join('=').replace(/\+/g, ' '));

      if (key) output[key] = nextValue;
      return output;
    }, {});

const encodeLabelSegment = (value = '') => encodeURIComponent(`${value}`).replace(/%3A/gi, ':').replace(/%40/gi, '@');

const encodeQueryValue = (value = '') => encodeURIComponent(`${value}`);

const toDigits = (value, fallback) => {
  const parsed = parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toAlgorithm = (value = DEFAULT_ALGORITHM) => {
  const normalized = `${value}`.trim().toUpperCase();

  return DIGEST_ALGORITHMS[normalized] ? normalized : DEFAULT_ALGORITHM;
};

const sanitizeAccount = (value = '') => `${value}`.trim();
const sanitizeIssuer = (value = '') => `${value}`.trim();

const normalizeTOTP = (input = {}) => {
  const secret = normalizeSecret(input.secret);
  const issuer = sanitizeIssuer(input.issuer);
  const account = sanitizeAccount(input.account);
  const algorithm = toAlgorithm(input.algorithm);
  const digits = toDigits(input.digits, DEFAULT_DIGITS);
  const period = toDigits(input.period, DEFAULT_PERIOD);

  if (!secret || !isBase32Secret(secret)) return undefined;

  return {
    account,
    algorithm,
    digits,
    issuer,
    period,
    secret,
  };
};

const parseLabel = (value = '') => {
  const label = decodePathSegment(value);
  const separator = label.indexOf(':');

  if (separator < 0) return { account: label.trim(), issuer: '' };

  return {
    account: label.slice(separator + 1).trim(),
    issuer: label.slice(0, separator).trim(),
  };
};

const isBase32Secret = (value = '') => {
  const normalized = normalizeSecret(value);

  return !!normalized && /^[A-Z2-7]+=*$/.test(normalized);
};

const parseTOTPURI = (value = '') => {
  const text = `${value}`.trim();
  if (!/^otpauth:\/\/totp\//i.test(text)) return undefined;

  const match = text.match(/^otpauth:\/\/totp\/([^?]+)(?:\?(.*))?$/i);
  if (!match) return undefined;

  const [, rawLabel = '', rawQuery = ''] = match;
  const params = parseQuery(rawQuery);
  const label = parseLabel(rawLabel);
  const issuer = sanitizeIssuer(params.issuer || label.issuer);
  const account = sanitizeAccount(label.account);

  return normalizeTOTP({
    account,
    algorithm: params.algorithm,
    digits: params.digits,
    issuer,
    period: params.period,
    secret: params.secret,
  });
};

const buildTOTPURI = (input = {}) => {
  const config = normalizeTOTP(input);
  if (!config) return '';

  const label =
    config.issuer && config.account ? `${config.issuer}:${config.account}` : config.account || config.issuer;
  if (!label) return '';

  const query = [
    `secret=${encodeQueryValue(config.secret)}`,
    config.issuer ? `issuer=${encodeQueryValue(config.issuer)}` : '',
    `algorithm=${encodeQueryValue(config.algorithm)}`,
    `digits=${encodeQueryValue(config.digits)}`,
    `period=${encodeQueryValue(config.period)}`,
  ]
    .filter(Boolean)
    .join('&');

  return `${TOTP_PREFIX}${encodeLabelSegment(label)}?${query}`;
};

const toBytes = (value = '') => {
  const normalized = normalizeSecret(value).replace(/=+$/g, '');
  let buffer = 0;
  let bits = 0;
  const output = [];

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) return undefined;

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 255);
    }
  }

  return Uint8Array.from(output);
};

const concatBytes = (...parts) => {
  const length = parts.reduce((total, part = new Uint8Array()) => total + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;

  parts.forEach((part = new Uint8Array()) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
};

const normalizeKey = async (keyBytes = new Uint8Array(), algorithm = DEFAULT_ALGORITHM) => {
  const blockSize = BLOCK_SIZES[algorithm] || BLOCK_SIZES[DEFAULT_ALGORITHM];
  let output = keyBytes;

  if (output.length > blockSize) {
    output = new Uint8Array(await digest(DIGEST_ALGORITHMS[algorithm], output));
  }

  if (output.length === blockSize) return output;

  const padded = new Uint8Array(blockSize);
  padded.set(output);
  return padded;
};

const hmacDigest = async (algorithm = DEFAULT_ALGORITHM, keyBytes = new Uint8Array(), payload = new Uint8Array()) => {
  const normalizedKey = await normalizeKey(keyBytes, algorithm);
  const innerPad = new Uint8Array(normalizedKey.length);
  const outerPad = new Uint8Array(normalizedKey.length);

  for (let index = 0; index < normalizedKey.length; index += 1) {
    innerPad[index] = normalizedKey[index] ^ 0x36;
    outerPad[index] = normalizedKey[index] ^ 0x5c;
  }

  const innerHash = new Uint8Array(await digest(DIGEST_ALGORITHMS[algorithm], concatBytes(innerPad, payload)));
  return new Uint8Array(await digest(DIGEST_ALGORITHMS[algorithm], concatBytes(outerPad, innerHash)));
};

const getCounterBytes = (timeMs = Date.now(), period = DEFAULT_PERIOD) => {
  let counter = Math.floor(timeMs / 1000 / period);
  const output = new Uint8Array(8);

  for (let index = 7; index >= 0; index -= 1) {
    output[index] = counter & 255;
    counter = Math.floor(counter / 256);
  }

  return output;
};

const getTOTPCode = async (input = {}, timeMs = Date.now()) => {
  const config = typeof input === 'string' ? parseTOTPURI(input) : normalizeTOTP(input);
  if (!config) return undefined;

  const keyBytes = toBytes(config.secret);
  if (!keyBytes?.length) return undefined;

  const payload = getCounterBytes(timeMs, config.period);
  const hash = await hmacDigest(config.algorithm, keyBytes, payload);
  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  return `${code % 10 ** config.digits}`.padStart(config.digits, '0');
};

const getTOTPRemainingSeconds = (input = {}, timeMs = Date.now()) => {
  const config = typeof input === 'string' ? parseTOTPURI(input) : normalizeTOTP(input);
  if (!config) return undefined;

  const current = Math.floor(timeMs / 1000);
  const remaining = config.period - (current % config.period);

  return remaining || config.period;
};

const getTOTPState = async (input = {}, timeMs = Date.now()) => {
  const config = typeof input === 'string' ? parseTOTPURI(input) : normalizeTOTP(input);
  if (!config) return undefined;

  const code = await getTOTPCode(config, timeMs);
  if (!code) return undefined;

  return {
    code,
    expiresIn: getTOTPRemainingSeconds(config, timeMs),
    period: config.period,
  };
};

const getTOTPDisplayName = (input = {}) => {
  const config = typeof input === 'string' ? parseTOTPURI(input) : normalizeTOTP(input);
  if (!config) return '';

  return config.issuer || config.account || '2FA';
};

const isTOTPURI = (value = '') => !!parseTOTPURI(value);

const getMaskedTOTPSecret = (input = {}) => {
  const config = typeof input === 'string' ? parseTOTPURI(input) : normalizeTOTP(input);
  if (!config) return '';

  return config.secret.replace(/./g, '*');
};

const parseTOTPSecret = (value = '') => normalizeSecret(value);

export {
  buildTOTPURI,
  DEFAULT_ALGORITHM,
  DEFAULT_DIGITS,
  DEFAULT_PERIOD,
  getMaskedTOTPSecret,
  getTOTPCode,
  getTOTPDisplayName,
  getTOTPRemainingSeconds,
  getTOTPState,
  isBase32Secret,
  isTOTPURI,
  normalizeTOTP,
  parseTOTPSecret,
  parseTOTPURI,
};
