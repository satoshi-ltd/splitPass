import { Cypher } from './cypher';
import { isSeedPhrase } from './isSeedPhrase';
import { shamir } from './shamir';
import { SECRET_TYPE, SHARD_TYPES_V2 } from '../App.constants';
import { bip39 } from './repositories/bip39';
import { chars } from './repositories/chars';
import { buildCardValue, parseCardValue } from './secretValueDisplay';
import { isTOTPURI } from './totp';

const {
  PASSWORD,
  PASSWORD_SECURE,
  SEED_PHRASE,
  SEED_PHRASE_SECURE,
  SEED_PHRASE_SHARD,
  CARD,
  CARD_SECURE,
  CARD_SHARD,
  TOTP,
  PASSWORD_SHARD_V2,
  SEED_PHRASE_SHARD_V2,
  CARD_SHARD_V2,
} = SECRET_TYPE;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const SHARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const bytesToShardText = (bytes = new Uint8Array()) => {
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const hasSecond = index + 1 < bytes.length;
    const hasThird = index + 2 < bytes.length;
    const chunk =
      ((bytes[index] || 0) << 16) | ((hasSecond ? bytes[index + 1] : 0) << 8) | (hasThird ? bytes[index + 2] : 0);

    output += SHARD_ALPHABET[(chunk >> 18) & 63] + SHARD_ALPHABET[(chunk >> 12) & 63];
    if (hasSecond) output += SHARD_ALPHABET[(chunk >> 6) & 63];
    if (hasThird) output += SHARD_ALPHABET[chunk & 63];
  }

  return output;
};

const shardTextToBytes = (text = '') => {
  const bytes = [];

  for (let index = 0; index < text.length; index += 4) {
    const c2 = text[index + 2] !== undefined ? SHARD_ALPHABET.indexOf(text[index + 2]) : -1;
    const c3 = text[index + 3] !== undefined ? SHARD_ALPHABET.indexOf(text[index + 3]) : -1;
    const chunk =
      (SHARD_ALPHABET.indexOf(text[index]) << 18) |
      (SHARD_ALPHABET.indexOf(text[index + 1]) << 12) |
      ((c2 < 0 ? 0 : c2) << 6) |
      (c3 < 0 ? 0 : c3);

    bytes.push((chunk >> 16) & 255);
    if (c2 >= 0) bytes.push((chunk >> 8) & 255);
    if (c3 >= 0) bytes.push(chunk & 255);
  }

  return new Uint8Array(bytes);
};

const shardMarker = (type) =>
  isTypeSeedPhrase(type) ? SEED_PHRASE_SHARD_V2 : isTypeCard(type) ? CARD_SHARD_V2 : PASSWORD_SHARD_V2;

const encodeShard = (marker, x, y = new Uint8Array()) => {
  const buffer = new Uint8Array(1 + y.length);
  buffer[0] = x;
  buffer.set(y, 1);

  return `${marker}${bytesToShardText(buffer)}`;
};

const decodeShard = (shard = '') => {
  const buffer = shardTextToBytes(`${shard}`.slice(1));

  return { x: buffer[0], y: buffer.slice(1) };
};

const CONFIG = {
  password: { regexp: /.{1,2}/g, set: chars, join: '', mask: '00' },
  seedPhrase: { regexp: /.{1,4}/g, set: bip39, join: ' ', mask: '0000' },
};

const isTypeSeedPhrase = (type) => [SEED_PHRASE, SEED_PHRASE_SECURE, SEED_PHRASE_SHARD].includes(type);
const isTypeCard = (type) => [CARD, CARD_SECURE, CARD_SHARD].includes(type);
const isTypeTOTP = (type) => [TOTP].includes(type);
const isCardTypeRequest = (type) => ['card', CARD, CARD_SECURE, CARD_SHARD].includes(type);
const isTOTPTypeRequest = (type) => ['totp', TOTP].includes(type);

const getConfig = (type) => CONFIG[isTypeSeedPhrase(type) ? 'seedPhrase' : 'password'];
const PASSWORD_CONFIG = CONFIG.password;
const CARD_SHARD_MASK_CHAR = '_';
const CARD_SHARD_SEGMENTS = 8;

const resolveEncodeOptions = (optionsOrSecure = false) =>
  typeof optionsOrSecure === 'object' && optionsOrSecure !== null ? optionsOrSecure : { secure: !!optionsOrSecure };

const encodeWithConfig = (value = '', { set } = PASSWORD_CONFIG) => {
  const source = Array.from(`${value}`);

  if (source.some((char) => set.indexOf(char) < 0)) return undefined;

  return source.map((char) => (set.indexOf(char) + 1).toString().padStart(2, '0')).join('');
};

const decodeWithConfig = (digits = '', { regexp, set, join } = PASSWORD_CONFIG) =>
  (digits.match(regexp || []) || []).map((index) => set[parseInt(index - 1)]).join(join);

const isMaskedSegment = (segment = '') => !!segment && new RegExp(`^${CARD_SHARD_MASK_CHAR}+$`).test(segment);

const decodeCardShard = (value = '') => {
  const [, ...rawDigits] = `${value}`;
  const segments = decodeWithConfig(rawDigits.join(''), PASSWORD_CONFIG).split('|');

  return segments.length === CARD_SHARD_SEGMENTS ? segments : undefined;
};

const buildCardQr = (value = '', secure = false) => {
  const digits = encodeWithConfig(value, PASSWORD_CONFIG);

  return digits === undefined ? '' : `${secure ? CARD_SECURE : CARD}${digits}`;
};

const combineCardShards = (...qrs) => {
  const decodedShards = qrs.map(decodeCardShard);
  if (decodedShards.some((segments) => !segments)) return '';

  const segments = Array.from(
    { length: CARD_SHARD_SEGMENTS },
    (_, index) => decodedShards.map((shard) => shard[index]).find((segment) => !isMaskedSegment(segment)) || '',
  );

  const cardValue = buildCardValue(
    segments.slice(0, 4).join(''),
    `${segments[4]}/${segments[5]}`,
    `${segments[6]}${segments[7]}`,
  );

  return cardValue ? buildCardQr(cardValue) : '';
};

export const USERNAME_TYPE = 'B';

export const getUnsupportedChars = (value = '') => [
  ...new Set(Array.from(`${value}`).filter((char) => chars.indexOf(char) < 0)),
];

export const QRParser = {
  encodeWithUsername: (value = '', username = '') => {
    if (!username || !value) return value;
    return `${USERNAME_TYPE}${encodeURIComponent(username)}:${value}`;
  },

  decodeWithUsername: (qr = '') => {
    if (!qr || qr[0] !== USERNAME_TYPE) return { value: qr, username: undefined };
    const colonIdx = qr.indexOf(':');
    if (colonIdx < 2) return { value: qr, username: undefined };
    try {
      return {
        username: decodeURIComponent(qr.slice(1, colonIdx)),
        value: qr.slice(colonIdx + 1),
      };
    } catch {
      return { value: qr, username: undefined };
    }
  },

  encode: (secret = '', optionsOrSecure = false) => {
    const { secure = false, type: requestedType } = resolveEncodeOptions(optionsOrSecure);
    let digits = Array.isArray(secret) ? secret.join(' ') : `${secret}`.trim();
    let type = secure ? PASSWORD_SECURE : PASSWORD;

    if (isTOTPTypeRequest(requestedType) || isTOTPURI(digits)) {
      type = TOTP;
      digits = encodeWithConfig(digits, PASSWORD_CONFIG);
    } else if (isCardTypeRequest(requestedType)) {
      type = secure ? CARD_SECURE : CARD;
      digits = encodeWithConfig(digits, PASSWORD_CONFIG);
    } else if (isSeedPhrase(digits)) {
      const words = digits.split(' ');
      digits = words.map((word) => String(bip39.findIndex((item) => item === word) + 1).padStart(4, '0')).join('');
      type = secure ? SEED_PHRASE_SECURE : SEED_PHRASE;
    } else {
      digits = encodeWithConfig(digits, PASSWORD_CONFIG);
    }

    if (digits === undefined) return undefined;

    return `${type}${digits}`;
  },

  decode: (qr = '', pin) => {
    const [type, ...rawDigits] = qr;
    const { regexp, set, join } = getConfig(type);

    let digits = rawDigits.join('');
    if (pin) {
      digits = Cypher.decrypt(digits, pin);
      // ! TODO: Should alert when there is no digits (indicates is not valid password)
      if (digits?.length !== rawDigits.join('').length) return undefined;
    }

    const decoded = decodeWithConfig(digits, { regexp, set, join });

    if (isTypeCard(type) && type !== CARD_SHARD && !parseCardValue(decoded)) return undefined;
    if (isTypeTOTP(type) && !isTOTPURI(decoded)) return undefined;

    return decoded;
  },

  split: (qr = '', shares = 3) => {
    const type = qr[0];
    if (!type || type === TOTP) return [];

    const points = shamir.split(TEXT_ENCODER.encode(qr), shares, 2);

    return points.map(({ x, y }) => encodeShard(shardMarker(type), x, y));
  },

  combine: (...qrs) => {
    if (!qrs.length) return '';

    if (SHARD_TYPES_V2.includes(qrs[0]?.[0])) {
      return TEXT_DECODER.decode(shamir.combine(qrs.map(decodeShard)));
    }

    if (qrs.every((qr = '') => isTypeCard(qr[0])) && qrs[0]?.[0] === CARD_SHARD) {
      return combineCardShards(...qrs);
    }

    return qrs[0]
      .split('')
      .map((_, index) => qrs.map((qr) => qr[index]).find((digit) => digit !== '0') || '0')
      .join('');
  },
};
