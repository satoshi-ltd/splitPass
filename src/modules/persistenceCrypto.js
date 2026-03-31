/* global Uint8Array */
import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
  CryptoDigestAlgorithm,
  digest,
  getRandomBytes,
} from 'expo-crypto';

const STORE_FORMAT = 'splitpass.encrypted.v2';
const LEGACY_STORE_FORMAT = 'splitpass.encrypted.v1';
const KDF_ROUNDS = 10000;
const KEY_LENGTH = 32;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

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

const encodeJson = (value = {}) => TEXT_ENCODER.encode(JSON.stringify(value));
const decodeJson = (bytes = new Uint8Array()) => JSON.parse(TEXT_DECODER.decode(bytes));
const encodePassphrase = (passphrase = '') => TEXT_ENCODER.encode(`${passphrase}`);

const deriveWrappingKeyBytes = async (passphrase = '', salt = getRandomBytes(16)) => {
  if (`${passphrase}`.length < 8) throw new Error('Master passphrase is too short.');

  let output = concatBytes(salt, encodePassphrase(passphrase));

  for (let round = 0; round < KDF_ROUNDS; round += 1) {
    // Expo exposes native digests, but not PBKDF2/Argon2 in this SDK.
    output = new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, concatBytes(output, salt)));
  }

  return { keyBytes: output.slice(0, KEY_LENGTH), salt };
};

const importKey = async (keyBytes = new Uint8Array()) => AESEncryptionKey.import(keyBytes);

const normalizeBinaryOutput = (value = new Uint8Array()) => (typeof value === 'string' ? value : toBase64(value));
const isSealedPayload = (value = {}) =>
  isObject(value) &&
  typeof value.iv === 'string' &&
  typeof value.ciphertext === 'string' &&
  Number.isInteger(value.tagLength);

const sealBytes = async (bytes = new Uint8Array(), keyBytes = new Uint8Array()) => {
  const key = await importKey(keyBytes);
  const sealed = await aesEncryptAsync(toBase64(bytes), key);

  return {
    ciphertext: normalizeBinaryOutput(await sealed.ciphertext({ includeTag: true })),
    iv: normalizeBinaryOutput(await sealed.iv()),
    tagLength: sealed.tagSize,
  };
};

const openBytes = async (input = '', keyBytes = new Uint8Array()) => {
  const key = await importKey(keyBytes);
  const sealed = isSealedPayload(input)
    ? AESSealedData.fromParts(fromBase64(input.iv), fromBase64(input.ciphertext), input.tagLength)
    : AESSealedData.fromCombined(fromBase64(`${input}`));
  const plaintextBase64 = await aesDecryptAsync(sealed, key, { output: 'base64' });

  return fromBase64(plaintextBase64);
};

const createEncryptedEnvelope = async (payload = {}, passphrase = '') => {
  const { keyBytes, salt } = await deriveWrappingKeyBytes(passphrase);

  return {
    ciphertext: await sealBytes(encodeJson(clone(payload)), keyBytes),
    kdf: {
      algorithm: 'sha256-iterative',
      rounds: KDF_ROUNDS,
      salt: toHex(salt),
    },
    type: STORE_FORMAT,
  };
};

const decryptLegacyEnvelope = async (envelope = {}, passphrase = '') => {
  const salt = fromHex(envelope?.kdf?.salt || '');
  const { keyBytes: wrappingKeyBytes } = await deriveWrappingKeyBytes(passphrase, salt);
  const dataKeyBytes = await openBytes(envelope.wrappedKey, wrappingKeyBytes);
  const payloadBytes = await openBytes(envelope.ciphertext, dataKeyBytes);

  return decodeJson(payloadBytes);
};

const decryptCurrentEnvelope = async (envelope = {}, passphrase = '') => {
  const salt = fromHex(envelope?.kdf?.salt || '');
  if (!isSealedPayload(envelope?.ciphertext)) {
    const error = new Error('Unsupported encrypted payload.');
    error.code = 'ERR_PERSISTENCE_FORMAT';
    throw error;
  }
  const { keyBytes } = await deriveWrappingKeyBytes(passphrase, salt);
  const payloadBytes = await openBytes(envelope.ciphertext, keyBytes);

  return decodeJson(payloadBytes);
};

const decryptEncryptedEnvelope = async (envelope = {}, passphrase = '') => {
  if (!isEncryptedEnvelope(envelope)) {
    const error = new Error('Unsupported encrypted payload.');
    error.code = 'ERR_PERSISTENCE_FORMAT';
    throw error;
  }

  try {
    if (envelope.type === LEGACY_STORE_FORMAT) return await decryptLegacyEnvelope(envelope, passphrase);

    return await decryptCurrentEnvelope(envelope, passphrase);
  } catch (cause) {
    if (cause?.code === 'ERR_PERSISTENCE_FORMAT') throw cause;

    const error = new Error('Unable to unlock encrypted payload.');
    error.code = 'ERR_PERSISTENCE_UNLOCK_FAILED';
    throw error;
  }
};

const isEncryptedEnvelope = (value = {}) =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  [STORE_FORMAT, LEGACY_STORE_FORMAT].includes(value.type);

export { createEncryptedEnvelope, decryptEncryptedEnvelope, isEncryptedEnvelope, STORE_FORMAT };
