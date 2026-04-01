import { SECRET_TYPE } from '../../App.constants';
import { Cypher, QRParser } from '../../modules';
import { buildCardValue } from '../../modules/secretValueDisplay';
import { buildTOTPURI } from '../../modules/totp';

const { PASSWORD, PASSWORD_SECURE, SEED_PHRASE, SEED_PHRASE_SECURE, CARD, CARD_SECURE, TOTP } = SECRET_TYPE;

const MOCK_PASSCODE = '123456';

const SEED_12_A = 'ability access accident account accuse achieve acid acoustic acquire across act action';
const SEED_12_B = 'banner bar barely bargain barrel base basic basket battle beach bean beauty';
const SEED_24_A =
  'damage dance danger daring dash daughter dawn day deal debate debris decade decide decline decorate decrease deer defense define degree delay deliver demand';
const SEED_24_B =
  'eager eagle early earn earth easily east easy echo ecology economy edge edit educate effort egg eight either elbow elder electric elegant element';
const SEED_24_C =
  'fabric face faculty fade faint faith fall false fame family famous fancy fantasy farm fashion fatal father fatigue fault favorite feature february federal fee';

const encodeSecret = (secret, passcode, options = {}) => {
  const qr = QRParser.encode(secret, options.type ? { type: options.type } : !!passcode);
  if (!passcode) return qr;

  let [type, ...digits] = qr;
  if (type === PASSWORD) type = PASSWORD_SECURE;
  if (type === SEED_PHRASE) type = SEED_PHRASE_SECURE;
  if (type === CARD) type = CARD_SECURE;

  return `${type}${Cypher.encrypt(digits.join(''), passcode)}`;
};

const createWebsiteSecret = (name, website, secret) => ({
  name,
  value: QRParser.encode(secret),
  website,
});

const createLegacySecureSecret = (name, website, secret, passcode = MOCK_PASSCODE) => ({
  name,
  value: encodeSecret(secret, passcode),
  website,
});

const createShardSecrets = (baseName, website, secret) =>
  QRParser.split(QRParser.encode(secret)).map((value, index) => ({
    name: `${baseName} ${index + 1}`,
    value,
    website,
  }));

const createCardSecret = (name, website, number, expire, cvv, extra = {}) => ({
  brand: extra.brand,
  cardNumber: number,
  cvv,
  expire,
  kind: 'card',
  name,
  value: QRParser.encode(buildCardValue(number, expire, cvv), { type: 'card' }),
  website,
});

const createLegacySecureCardSecret = (name, website, number, expire, cvv, passcode = MOCK_PASSCODE, extra = {}) => ({
  ...createCardSecret(name, website, number, expire, cvv, extra),
  value: encodeSecret(buildCardValue(number, expire, cvv), passcode, { type: 'card' }),
});

const createCardShardSecrets = (baseName, website, number, expire, cvv, extra = {}) =>
  QRParser.split(QRParser.encode(buildCardValue(number, expire, cvv), { type: 'card' })).map((value, index) => ({
    brand: extra.brand,
    cardNumber: number,
    cvv,
    expire,
    kind: 'card',
    name: `${baseName} ${index + 1}`,
    value,
    website,
  }));

const createTOTPSecret = (name, website, config = {}) => {
  const value = buildTOTPURI(config);

  return {
    account: config.account,
    algorithm: config.algorithm || 'SHA1',
    digits: config.digits || 6,
    issuer: config.issuer,
    kind: 'totp',
    name,
    period: config.period || 30,
    value: QRParser.encode(value, { type: TOTP }),
    website,
  };
};

export {
  createCardSecret,
  createCardShardSecrets,
  createLegacySecureCardSecret,
  createLegacySecureSecret,
  createShardSecrets,
  createTOTPSecret,
  createWebsiteSecret,
  encodeSecret,
  MOCK_PASSCODE,
  SEED_12_A,
  SEED_12_B,
  SEED_24_A,
  SEED_24_B,
  SEED_24_C,
};
