import { isSeedPhrase } from './isSeedPhrase';
import { bip39, chars } from './repositories';
import { QR_TYPE } from '../App.constants';
import { Cypher } from './cypher';

const { PASSWORD, PASSWORD_SECURE, SEED_PHRASE, SEED_PHRASE_SECURE, PASSWORD_SHARD, SEED_PHRASE_SHARD } = QR_TYPE;

const CONFIG = {
  password: { regexp: /.{1,2}/g, set: chars, join: '', mask: '00' },
  seedPhrase: { regexp: /.{1,4}/g, set: bip39, join: ' ', mask: '0000' },
};

const isTypeSeedPhrase = (type) => [SEED_PHRASE, SEED_PHRASE_SECURE, SEED_PHRASE_SHARD].includes(type);

const getConfig = (type) => CONFIG[isTypeSeedPhrase(type) ? 'seedPhrase' : 'password'];

export const QRParser = {
  encode: (secret = '', secure = false) => {
    let digits = Array.isArray(secret) ? secret.join(' ') : secret.trim();
    let type = secure ? PASSWORD_SECURE : PASSWORD;

    if (isSeedPhrase(digits)) {
      const words = digits.split(' ');
      digits = words.map((word) => String(bip39.findIndex((item) => item === word) + 1).padStart(4, '0')).join('');
      type = secure ? SEED_PHRASE_SECURE : SEED_PHRASE;
    } else {
      digits = Array.from(digits, (char) => (chars.indexOf(char) + 1).toString().padStart(2, '0')).join('');
    }

    const qr = `${type}${digits}`;

    return qr;
  },

  decode: (qr = '', pin) => {
    let [type, ...digits] = qr;
    const { regexp, set, join } = getConfig(type);

    digits = digits.join('');
    if (pin) digits = Cypher.decrypt(digits, pin);

    const value = digits
      .match(regexp || [])
      .map((index) => set[parseInt(index - 1)])
      .join(join);

    return value;
  },

  split: (qr = '', shares = 3) => {
    let [type, ...digits] = qr;
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
    return (
      qrs[0]
        .split('')
        // .map((_, index) => qrs.map((qr) => qr[index]).find((digit) => digit !== '0') || '0')
        .map((_, index) => qrs.map((qr) => qr[index]).find((digit) => digit !== '0') || '0')
        .join('')
    );
  },
};
