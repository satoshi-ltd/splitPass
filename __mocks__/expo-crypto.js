/* global ArrayBuffer, Uint8Array */
const { createCipheriv, createDecipheriv, createHash, randomBytes } = require('node:crypto');

const toBuffer = (value, encoding = 'base64') => {
  if (!value) return Buffer.alloc(0);
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (typeof value === 'string') return Buffer.from(value, encoding);

  return Buffer.from(value);
};

class AESEncryptionKey {
  constructor(bytes = Buffer.alloc(32)) {
    this._bytes = Buffer.from(bytes);
    this.size = this._bytes.length * 8;
  }

  static async import(input, encoding) {
    let bytes;

    if (typeof input === 'string') bytes = Buffer.from(input, encoding === 'hex' ? 'hex' : 'base64');
    else bytes = toBuffer(input, 'base64');

    return new AESEncryptionKey(bytes);
  }
}

class AESSealedData {
  constructor(iv = Buffer.alloc(12), ciphertext = Buffer.alloc(0), tag = Buffer.alloc(16)) {
    this._iv = Buffer.from(iv);
    this._ciphertext = Buffer.from(ciphertext);
    this._tag = Buffer.from(tag);
    this.combinedSize = this._iv.length + this._ciphertext.length + this._tag.length;
    this.ivSize = this._iv.length;
    this.tagSize = this._tag.length;
  }

  static fromCombined(combined, config = {}) {
    const bytes = toBuffer(combined, 'base64');
    const ivLength = config.ivLength || 12;
    const tagLength = config.tagLength || 16;
    const ciphertext = bytes.subarray(ivLength, bytes.length - tagLength);
    const tag = bytes.subarray(bytes.length - tagLength);

    return new AESSealedData(bytes.subarray(0, ivLength), ciphertext, tag);
  }

  static fromParts(iv, ciphertext, tag) {
    const ivBytes = toBuffer(iv, 'base64');
    const ciphertextBytes = toBuffer(ciphertext, 'base64');

    if (typeof tag === 'number' || tag === undefined) {
      const tagLength = tag || 16;
      const payloadLength = Math.max(0, ciphertextBytes.length - tagLength);

      return new AESSealedData(
        ivBytes,
        ciphertextBytes.subarray(0, payloadLength),
        ciphertextBytes.subarray(payloadLength),
      );
    }

    return new AESSealedData(ivBytes, ciphertextBytes, toBuffer(tag, 'base64'));
  }

  async iv(encoding = 'bytes') {
    return encoding === 'base64' ? this._iv.toString('base64') : Uint8Array.from(this._iv);
  }

  async tag(encoding = 'bytes') {
    return encoding === 'base64' ? this._tag.toString('base64') : Uint8Array.from(this._tag);
  }

  async ciphertext(options = {}) {
    const includeTag = options?.includeTag ?? false;
    const encoding = options?.encoding || options?.outputFormat || 'bytes';
    const value = includeTag ? Buffer.concat([this._ciphertext, this._tag]) : this._ciphertext;

    return encoding === 'base64' ? value.toString('base64') : Uint8Array.from(value);
  }

  async combined(encoding = 'bytes') {
    const value = Buffer.concat([this._iv, this._ciphertext, this._tag]);

    return encoding === 'base64' ? value.toString('base64') : Uint8Array.from(value);
  }
}

const aesEncryptAsync = async (plaintext, key, options = {}) => {
  const bytes = toBuffer(plaintext, 'base64');
  const nonce = options?.nonce;
  const iv =
    typeof nonce === 'number' ? randomBytes(nonce) : nonce?.bytes ? toBuffer(nonce.bytes, 'base64') : randomBytes(12);
  const cipher = createCipheriv(`aes-${key._bytes.length * 8}-gcm`, key._bytes, iv);

  if (options?.additionalData) cipher.setAAD(toBuffer(options.additionalData, 'base64'));

  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  const tag = cipher.getAuthTag();

  return new AESSealedData(iv, ciphertext, tag);
};

const aesDecryptAsync = async (sealedData, key, options = {}) => {
  const decipher = createDecipheriv(`aes-${key._bytes.length * 8}-gcm`, key._bytes, sealedData._iv);

  if (options?.additionalData) decipher.setAAD(toBuffer(options.additionalData, 'base64'));

  decipher.setAuthTag(sealedData._tag);

  const plaintext = Buffer.concat([decipher.update(sealedData._ciphertext), decipher.final()]);

  return options?.output === 'base64' ? plaintext.toString('base64') : Uint8Array.from(plaintext);
};

const digest = async (algorithm, data) => {
  const normalizedAlgorithm = `${algorithm}`.replace(/^SHA/i, 'sha').toLowerCase();
  const value = createHash(normalizedAlgorithm).update(Buffer.from(data)).digest();

  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
};

const getRandomBytes = (length) => Uint8Array.from(randomBytes(length));

module.exports = {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
  CryptoDigestAlgorithm: {
    SHA256: 'sha256',
  },
  digest,
  getRandomBytes,
};
