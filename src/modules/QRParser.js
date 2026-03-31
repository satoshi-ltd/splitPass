import { Cypher } from './cypher';
import { isSeedPhrase } from './isSeedPhrase';
import { SECRET_TYPE } from '../App.constants';
import { bip39 } from './repositories/bip39';
import { chars } from './repositories/chars';
import { buildCardValue, parseCardValue } from './secretValueDisplay';

const {
  PASSWORD,
  PASSWORD_SECURE,
  SEED_PHRASE,
  SEED_PHRASE_SECURE,
  PASSWORD_SHARD,
  SEED_PHRASE_SHARD,
  CARD,
  CARD_SECURE,
  CARD_SHARD,
} = SECRET_TYPE;

const CONFIG = {
  password: { regexp: /.{1,2}/g, set: chars, join: '', mask: '00' },
  seedPhrase: { regexp: /.{1,4}/g, set: bip39, join: ' ', mask: '0000' },
};

const isTypeSeedPhrase = (type) => [SEED_PHRASE, SEED_PHRASE_SECURE, SEED_PHRASE_SHARD].includes(type);
const isTypeCard = (type) => [CARD, CARD_SECURE, CARD_SHARD].includes(type);
const isCardTypeRequest = (type) => ['card', CARD, CARD_SECURE, CARD_SHARD].includes(type);

const getConfig = (type) => CONFIG[isTypeSeedPhrase(type) ? 'seedPhrase' : 'password'];
const PASSWORD_CONFIG = CONFIG.password;
const CARD_SHARD_MASK_CHAR = '_';
const CARD_SHARD_SEGMENTS = 8;

const resolveEncodeOptions = (optionsOrSecure = false) =>
  typeof optionsOrSecure === 'object' && optionsOrSecure !== null ? optionsOrSecure : { secure: !!optionsOrSecure };

const encodeWithConfig = (value = '', { set } = PASSWORD_CONFIG) =>
  Array.from(`${value}`, (char) => (set.indexOf(char) + 1).toString().padStart(2, '0')).join('');

const decodeWithConfig = (digits = '', { regexp, set, join } = PASSWORD_CONFIG) =>
  (digits.match(regexp || []) || []).map((index) => set[parseInt(index - 1)]).join(join);

const splitCardNumber = (number = '') => {
  const base = Math.floor(number.length / 4);
  const remainder = number.length % 4;
  let cursor = 0;

  return Array.from({ length: 4 }, (_, index) => {
    const size = base + (index < remainder ? 1 : 0);
    const segment = number.slice(cursor, cursor + size);

    cursor += size;
    return segment;
  });
};

const splitCardCvv = (cvv = '') => {
  const pivot = Math.ceil(cvv.length / 2);

  return [cvv.slice(0, pivot), cvv.slice(pivot)];
};

const maskSegment = (segment = '') => CARD_SHARD_MASK_CHAR.repeat(segment.length || 1);
const isMaskedSegment = (segment = '') => !!segment && new RegExp(`^${CARD_SHARD_MASK_CHAR}+$`).test(segment);

const encodeCardShard = (segments = []) => `${CARD_SHARD}${encodeWithConfig(segments.join('|'), PASSWORD_CONFIG)}`;

const decodeCardShard = (value = '') => {
  const [, ...rawDigits] = `${value}`;
  const segments = decodeWithConfig(rawDigits.join(''), PASSWORD_CONFIG).split('|');

  return segments.length === CARD_SHARD_SEGMENTS ? segments : undefined;
};

const buildCardShardSegments = (card = {}) => [
  ...splitCardNumber(card.number),
  card.expire.slice(0, 2),
  card.expire.slice(3, 5),
  ...splitCardCvv(card.cvv),
];

const buildCardQr = (value = '', secure = false) =>
  `${secure ? CARD_SECURE : CARD}${encodeWithConfig(value, PASSWORD_CONFIG)}`;

const splitCardQr = (qr = '', shares = 3) => {
  const [, ...rawDigits] = qr;
  const card = parseCardValue(decodeWithConfig(rawDigits.join(''), PASSWORD_CONFIG));
  if (!card?.expire || !card?.cvv) return [];

  const segments = buildCardShardSegments(card);

  return Array.from({ length: shares }, (_, shareIndex) =>
    encodeCardShard(
      segments.map((segment, index) => ((shareIndex + index) % shares === 0 ? maskSegment(segment) : segment)),
    ),
  );
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

export const QRParser = {
  encode: (secret = '', optionsOrSecure = false) => {
    const { secure = false, type: requestedType } = resolveEncodeOptions(optionsOrSecure);
    let digits = Array.isArray(secret) ? secret.join(' ') : `${secret}`.trim();
    let type = secure ? PASSWORD_SECURE : PASSWORD;

    if (isCardTypeRequest(requestedType)) {
      type = secure ? CARD_SECURE : CARD;
      digits = encodeWithConfig(digits, PASSWORD_CONFIG);
    } else if (isSeedPhrase(digits)) {
      const words = digits.split(' ');
      digits = words.map((word) => String(bip39.findIndex((item) => item === word) + 1).padStart(4, '0')).join('');
      type = secure ? SEED_PHRASE_SECURE : SEED_PHRASE;
    } else {
      digits = encodeWithConfig(digits, PASSWORD_CONFIG);
    }

    const qr = `${type}${digits}`;

    return qr;
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

    return decoded;
  },

  split: (qr = '', shares = 3) => {
    let [type, ...digits] = qr;
    if (type === CARD) return splitCardQr(qr, shares);

    const { regexp, mask } = getConfig(type);
    type = isTypeSeedPhrase(type) ? SEED_PHRASE_SHARD : PASSWORD_SHARD;

    const shards = digits.join('').match(regexp);

    return Array.from({ length: shares }, (_, shareIndex) =>
      Array.from({ length: shards.length }, (_, index) =>
        (shareIndex + index) % shares !== 0 ? shards[index] : mask,
      ).join(''),
    ).map((qr) => `${type}${qr}`);
  },

  combine: (...qrs) => {
    if (!qrs.length) return '';

    if (qrs.every((qr = '') => isTypeCard(qr[0])) && qrs[0]?.[0] === CARD_SHARD) {
      return combineCardShards(...qrs);
    }

    return (
      qrs[0]
        .split('')
        // .map((_, index) => qrs.map((qr) => qr[index]).find((digit) => digit !== '0') || '0')
        .map((_, index) => qrs.map((qr) => qr[index]).find((digit) => digit !== '0') || '0')
        .join('')
    );
  },
};
