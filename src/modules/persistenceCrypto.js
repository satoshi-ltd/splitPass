/* global ArrayBuffer, Uint8Array */
import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
  CryptoDigestAlgorithm,
  digest,
  getRandomBytes,
} from 'expo-crypto';
import argon2 from 'react-native-argon2';

const STORE_VERSION = 3;
const STORE_FORMAT = 'splitpass.encrypted.v2';
const LEGACY_STORE_FORMAT = 'splitpass.encrypted.v1';
const KEY_LENGTH = 32;
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const KDF_CONFIG = {
  algorithm: 'argon2id',
  memory: 64 * 1024,
  parallelism: 1,
  rounds: 3,
  saltLength: 16,
};
const LEGACY_KDF_ROUNDS = 10000;

const clone = (value) => JSON.parse(JSON.stringify(value));
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const concatBytes = (...parts) => {
  const length = parts.reduce((total, part = new Uint8Array()) => total + part.length, 0);
  const joined = new Uint8Array(length);
  let offset = 0;

  parts.forEach((part = new Uint8Array()) => {
    joined.set(part, offset);
    offset += part.length;
  });

  return joined;
};

const normalizeBytes = (value = new Uint8Array()) => {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === 'string') return fromBase64(value);

  return new Uint8Array(value);
};

const toHex = (bytes = new Uint8Array()) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const fromHex = (value = '') => {
  const cleanValue = `${value}`.replace(/[^a-fA-F0-9]/g, '');

  if (!cleanValue) return new Uint8Array();

  const pairs = cleanValue.length % 2 === 0 ? cleanValue : `0${cleanValue}`;

  return Uint8Array.from(
    Array.from({ length: pairs.length / 2 }, (_, index) => parseInt(pairs.slice(index * 2, index * 2 + 2), 16)),
  );
};

const toBase64 = (bytes = new Uint8Array()) => {
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const chunk = ((bytes[index] || 0) << 16) | ((bytes[index + 1] || 0) << 8) | (bytes[index + 2] || 0);
    const hasSecond = index + 1 < bytes.length;
    const hasThird = index + 2 < bytes.length;

    output += BASE64_ALPHABET[(chunk >> 18) & 63];
    output += BASE64_ALPHABET[(chunk >> 12) & 63];
    output += hasSecond ? BASE64_ALPHABET[(chunk >> 6) & 63] : '=';
    output += hasThird ? BASE64_ALPHABET[chunk & 63] : '=';
  }

  return output;
};

const fromBase64 = (value = '') => {
  const cleanValue = `${value}`.replace(/[^A-Za-z0-9+/=]/g, '');

  if (!cleanValue) return new Uint8Array();

  const bytes = [];

  for (let index = 0; index < cleanValue.length; index += 4) {
    const encoded =
      (BASE64_ALPHABET.indexOf(cleanValue[index]) << 18) |
      (BASE64_ALPHABET.indexOf(cleanValue[index + 1]) << 12) |
      ((cleanValue[index + 2] === '=' ? 0 : BASE64_ALPHABET.indexOf(cleanValue[index + 2])) << 6) |
      (cleanValue[index + 3] === '=' ? 0 : BASE64_ALPHABET.indexOf(cleanValue[index + 3]));

    bytes.push((encoded >> 16) & 255);
    if (cleanValue[index + 2] !== '=') bytes.push((encoded >> 8) & 255);
    if (cleanValue[index + 3] !== '=') bytes.push(encoded & 255);
  }

  return new Uint8Array(bytes);
};

const toBase64Url = (bytes = new Uint8Array()) =>
  toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const fromBase64Url = (value = '') => {
  const normalized = `${value}`.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));

  return fromBase64(`${normalized}${padding}`);
};

const encodeJson = (value = {}) => TEXT_ENCODER.encode(JSON.stringify(value));
const decodeJson = (bytes = new Uint8Array()) => JSON.parse(TEXT_DECODER.decode(bytes));

const deriveWrappingKeyBytes = async (passphrase = '', salt = getRandomBytes(KDF_CONFIG.saltLength)) => {
  if (`${passphrase}`.length < 8) throw new Error('Master passphrase is too short.');

  const result = await argon2(`${passphrase}`, toHex(salt), {
    hashLength: KEY_LENGTH,
    iterations: KDF_CONFIG.rounds,
    memory: KDF_CONFIG.memory,
    mode: KDF_CONFIG.algorithm,
    parallelism: KDF_CONFIG.parallelism,
    saltEncoding: 'hex',
  });

  return { keyBytes: fromHex(result?.rawHash || ''), salt };
};

const deriveLegacyWrappingKeyBytes = async (passphrase = '', salt = getRandomBytes(16)) => {
  if (`${passphrase}`.length < 8) throw new Error('Master passphrase is too short.');

  let output = concatBytes(salt, TEXT_ENCODER.encode(`${passphrase}`));

  for (let round = 0; round < LEGACY_KDF_ROUNDS; round += 1) {
    output = new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, concatBytes(output, salt)));
  }

  return { keyBytes: output.slice(0, KEY_LENGTH), salt };
};

const importKey = async (keyBytes = new Uint8Array()) => AESEncryptionKey.import(keyBytes);

const isSealedPayload = (value = {}) =>
  isObject(value) &&
  typeof value.iv === 'string' &&
  typeof value.ciphertext === 'string' &&
  Number.isInteger(value.tagLength);

const openLegacyBytes = async (input = '', keyBytes = new Uint8Array()) => {
  const key = await importKey(keyBytes);
  const sealed = isSealedPayload(input)
    ? AESSealedData.fromParts(fromBase64(input.iv), fromBase64(input.ciphertext), input.tagLength)
    : AESSealedData.fromCombined(fromBase64(`${input}`));
  const plaintextBase64 = await aesDecryptAsync(sealed, key, { output: 'base64' });

  return fromBase64(plaintextBase64);
};

const sealCurrentBytes = async (
  bytes = new Uint8Array(),
  keyBytes = new Uint8Array(),
  nonce = getRandomBytes(NONCE_LENGTH),
) => {
  const key = await importKey(keyBytes);
  const sealed = await aesEncryptAsync(toBase64(bytes), key, { nonce: { bytes: nonce } });

  return {
    combined: toBase64Url(normalizeBytes(await sealed.ciphertext({ includeTag: true }))),
    nonce: normalizeBytes(await sealed.iv()),
  };
};

const openCurrentBytes = async (combined = '', keyBytes = new Uint8Array(), nonce = new Uint8Array()) => {
  const key = await importKey(keyBytes);
  const sealed = AESSealedData.fromParts(nonce, fromBase64Url(combined), TAG_LENGTH);
  const plaintextBase64 = await aesDecryptAsync(sealed, key, { output: 'base64' });

  return fromBase64(plaintextBase64);
};

const createEncryptedEnvelope = async (payload = {}, passphrase = '') => {
  const { keyBytes, salt } = await deriveWrappingKeyBytes(passphrase);
  const dataKey = getRandomBytes(KEY_LENGTH);
  const sharedNonce = getRandomBytes(NONCE_LENGTH);
  const wrappedKey = await sealCurrentBytes(dataKey, keyBytes, sharedNonce);
  const ciphertext = await sealCurrentBytes(encodeJson(clone(payload)), dataKey, sharedNonce);

  return {
    c: ciphertext.combined,
    k: {
      a: KDF_CONFIG.algorithm,
      m: KDF_CONFIG.memory,
      p: KDF_CONFIG.parallelism,
      s: toBase64Url(salt),
      t: KDF_CONFIG.rounds,
    },
    n: toBase64Url(wrappedKey.nonce),
    v: STORE_VERSION,
    w: wrappedKey.combined,
  };
};

const decryptLegacyEnvelope = async (envelope = {}, passphrase = '') => {
  const salt = fromHex(envelope?.kdf?.salt || '');
  const { keyBytes: wrappingKeyBytes } = await deriveLegacyWrappingKeyBytes(passphrase, salt);
  const dataKeyBytes = await openLegacyBytes(envelope.wrappedKey, wrappingKeyBytes);
  const payloadBytes = await openLegacyBytes(envelope.ciphertext, dataKeyBytes);

  return decodeJson(payloadBytes);
};

const decryptV2Envelope = async (envelope = {}, passphrase = '') => {
  const salt = fromHex(envelope?.kdf?.salt || '');
  if (!isSealedPayload(envelope?.ciphertext)) {
    const error = new Error('Unsupported encrypted payload.');
    error.code = 'ERR_PERSISTENCE_FORMAT';
    throw error;
  }

  const { keyBytes } = await deriveLegacyWrappingKeyBytes(passphrase, salt);
  const payloadBytes = await openLegacyBytes(envelope.ciphertext, keyBytes);

  return decodeJson(payloadBytes);
};

const decryptV3Envelope = async (envelope = {}, passphrase = '') => {
  const salt = fromBase64Url(envelope?.k?.s || '');
  const nonce = fromBase64Url(envelope?.n || '');

  if (!salt.length || !nonce.length || typeof envelope?.w !== 'string' || typeof envelope?.c !== 'string') {
    const error = new Error('Unsupported encrypted payload.');
    error.code = 'ERR_PERSISTENCE_FORMAT';
    throw error;
  }

  const { keyBytes } = await deriveWrappingKeyBytes(passphrase, salt);
  const dataKeyBytes = await openCurrentBytes(envelope.w, keyBytes, nonce);
  const payloadBytes = await openCurrentBytes(envelope.c, dataKeyBytes, nonce);

  return decodeJson(payloadBytes);
};

const isCurrentEncryptedEnvelope = (value = {}) =>
  isObject(value) &&
  value.v === STORE_VERSION &&
  isObject(value.k) &&
  value.k.a === KDF_CONFIG.algorithm &&
  typeof value.k.m === 'number' &&
  typeof value.k.p === 'number' &&
  typeof value.k.s === 'string' &&
  typeof value.k.t === 'number' &&
  typeof value.n === 'string' &&
  typeof value.w === 'string' &&
  typeof value.c === 'string';

const isLegacyEncryptedEnvelope = (value = {}) =>
  isObject(value) && [STORE_FORMAT, LEGACY_STORE_FORMAT].includes(value.type);

const decryptEncryptedEnvelope = async (envelope = {}, passphrase = '') => {
  if (!isEncryptedEnvelope(envelope)) {
    const error = new Error('Unsupported encrypted payload.');
    error.code = 'ERR_PERSISTENCE_FORMAT';
    throw error;
  }

  try {
    if (isCurrentEncryptedEnvelope(envelope)) return await decryptV3Envelope(envelope, passphrase);
    if (envelope.type === LEGACY_STORE_FORMAT) return await decryptLegacyEnvelope(envelope, passphrase);

    return await decryptV2Envelope(envelope, passphrase);
  } catch (cause) {
    if (cause?.code === 'ERR_PERSISTENCE_FORMAT') throw cause;

    const error = new Error('Unable to unlock encrypted payload.');
    error.code = 'ERR_PERSISTENCE_UNLOCK_FAILED';
    throw error;
  }
};

const isEncryptedEnvelope = (value = {}) => isCurrentEncryptedEnvelope(value) || isLegacyEncryptedEnvelope(value);

export {
  createEncryptedEnvelope,
  decryptEncryptedEnvelope,
  isCurrentEncryptedEnvelope,
  isEncryptedEnvelope,
  LEGACY_STORE_FORMAT,
  STORE_FORMAT,
  STORE_VERSION,
};
