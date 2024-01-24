import { isSeedPhrase } from './isSeedPhrase';
import { bip39, chars } from './repositories';
import { QR_TYPE } from '../App.constants';

const { PASSWORD, SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const CONFIG = {
  password: { regexp: /.{1,2}/g, set: chars, join: '', mask: '00' },
  seedPhrase: { regexp: /.{1,4}/g, set: bip39, join: ' ', mask: '0000' },
};

const getConfig = (type) => CONFIG[[SEED_PHRASE, SEED_PHRASE_ENCRYPTED].includes(type) ? 'seedPhrase' : 'password'];

export const QRParser = {
  encode: (secret = '') => {
    let digits = Array.isArray(secret) ? secret.join(' ') : secret.trim();
    let type = PASSWORD;

    if (isSeedPhrase(digits)) {
      const words = digits.split(' ');
      digits = words.map((word) => String(bip39.findIndex((item) => item === word) + 1).padStart(4, '0')).join('');
      type = SEED_PHRASE;
    } else {
      digits = Array.from(digits, (char) => (chars.indexOf(char) + 1).toString().padStart(2, '0')).join('');
    }

    const qr = `${type}${digits}`;

    return qr;
  },

  decode: (qr = '') => {
    const [type, ...digits] = qr;
    const { regexp, set, join } = getConfig(type);

    return digits
      .join('')
      .match(regexp || [])
      .map((index) => set[parseInt(index - 1)])
      .join(join);
  },

  split: (qr = '', shares = 3) => {
    const [type, ...digits] = qr;
    const { regexp, mask } = getConfig(type);

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
