import { QR_TYPE } from './constants';
import { Cypher } from './cypher';
import { isSeedPhrase } from './isSeedPhrase';
import { bip39, chars } from './repositories';

const { DEFAULT, DEFAULT_ENCRYPTED, SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

export const QRParser = {
  encode: (value = '', pin) => {
    let digits = Array.isArray(value) ? value.join(' ') : value.trim();
    let type;

    if (isSeedPhrase(digits)) {
      const words = digits.split(' ');
      type = pin ? SEED_PHRASE_ENCRYPTED : SEED_PHRASE;
      digits = words.map((word) => String(bip39.findIndex((item) => item === word) + 1).padStart(4, '0')).join('');
    } else {
      type = pin ? DEFAULT_ENCRYPTED : DEFAULT;
      digits = Array.from(digits, (char) => chars.indexOf(char).toString().padStart(2, '0')).join('');
    }

    if (pin) digits = Cypher.encrypt(digits, pin);

    return `${type}${digits}`;
  },

  decode: (qr = '', pin) => {
    const [type, ...digits] = qr.toString();
    const encrypted = pin ? Cypher.decrypt(digits.join(''), pin) : digits.join('');

    return [SEED_PHRASE, SEED_PHRASE_ENCRYPTED].includes(type)
      ? (encrypted.match(/.{1,4}/g) || []).map((index) => bip39[parseInt(index - 1)]).join(' ')
      : (encrypted.match(/.{1,2}/g) || []).map((index) => chars[parseInt(index)]).join('');
  },
};
