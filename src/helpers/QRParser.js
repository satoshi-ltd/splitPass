import { isSeedPhrase } from './isSeedPhrase';
import { bip39, chars } from './repositories';
import { QR_TYPE } from '../App.constants';

const { SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

export const QRParser = {
  encode: (secret = '') => {
    let digits = Array.isArray(secret) ? secret.join(' ') : secret.trim();

    if (isSeedPhrase(digits)) {
      const words = digits.split(' ');
      digits = words.map((word) => String(bip39.findIndex((item) => item === word) + 1).padStart(4, '0')).join('');
    } else {
      digits = Array.from(digits, (char) => (chars.indexOf(char) + 1).toString().padStart(2, '0')).join('');
    }

    return digits;
  },

  decode: (qr = '') => {
    const [type, ...digits] = qr;
    let secret = digits.join('');

    secret = [SEED_PHRASE, SEED_PHRASE_ENCRYPTED].includes(type)
      ? (secret.match(/.{1,4}/g) || []).map((index) => bip39[parseInt(index - 1)]).join(' ')
      : (secret.match(/.{1,2}/g) || []).map((index) => chars[parseInt(index - 1)]).join('');

    return secret;
  },

  split: (qr = '', shares = 3) => {
    return Array.from({ length: shares }, (_, shareIndex) =>
      Array.from({ length: qr.length }, (_, index) => ((shareIndex + index) % shares !== 0 ? qr[index] : '0')).join(''),
    );
  },

  combine: (...qrs) => {
    return qrs[0]
      .split('')
      .map((_, index) => qrs.map((qr) => qr[index]).find((digit) => digit !== '0') || '0')
      .join('');
  },
};
