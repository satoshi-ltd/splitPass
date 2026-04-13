import Constants from 'expo-constants';

const DEFAULT_THEME = 'system';

const EVENT = {
  NOTIFICATION: 'notification',
  PASSWORD_SELECTED: 'password-selected',
};

const FIELD = {
  NAME: { name: 'secret', placeholder: 'name...' },
  PASSCODE: { mask: true, name: 'passcode', keyboard: 'numeric', maxLength: 6, placeholder: 'passcode...' },
};

const IS_EXPO = Constants.appOwnership === 'expo';

const SECRET_TYPE = {
  PASSWORD: '1',
  PASSWORD_SECURE: '2',
  PASSWORD_SHARD: '3',
  SEED_PHRASE: '4',
  SEED_PHRASE_SECURE: '5',
  SEED_PHRASE_SHARD: '6',
  CARD: '7',
  CARD_SECURE: '8',
  CARD_SHARD: '9',
  TOTP: 'A',
};

const SECURE_TYPES = [SECRET_TYPE.PASSWORD_SECURE, SECRET_TYPE.SEED_PHRASE_SECURE, SECRET_TYPE.CARD_SECURE];

const SHARD_TYPES = [SECRET_TYPE.PASSWORD_SHARD, SECRET_TYPE.SEED_PHRASE_SHARD, SECRET_TYPE.CARD_SHARD];

const STORAGE_DOMAIN = 'com.satoshi-ltd.splitpass';

const VAULT_TYPE = ['Account', 'Finance', 'Social', 'others'];

const VAULTS_KEYWORDS = {
  [VAULT_TYPE[0]]: [
    'email',
    'account',
    'login',
    'user',
    'portal',
    'admin',
    'web',
    'outlook',
    'yahoo',
    'icloud',
    'gmail',
    'access',
    'credentials',
    'user',
    'auth',
  ],

  [VAULT_TYPE[1]]: [
    'bank',
    'card',
    'credit',
    'debit',
    'crypto',
    'wallet',
    'investment',
    'finance',
    'pay',
    'paypal',
    'stripe',
    'revolut',
    'venmo',
    'seedsigner',
    'seedphrase',
    'trezor',
    'ledger',
    'coldcard',
    'account-number',
    'chase',
    'citibank',
    'wells',
    'goldman',
    'visa',
    'mastercard',
    'amex',
    'bitcoin',
    'ethereum',
    'binance',
  ],

  [VAULT_TYPE[2]]: [
    'social',
    'facebook',
    'twitter',
    'x',
    'instagram',
    'linkedin',
    'tiktok',
    'snapchat',
    'messenger',
    'chat',
    'discord',
    'reddit',
    'community',
    'whatsapp',
    'google',
    'line',
    'youtube',
    'pinterest',
    'weibo',
  ],
};

const SATOSHI_URLS = {
  TERMS: 'https://www.satoshi-ltd.com/terms-of-use/',
  PRIVACY: 'https://www.satoshi-ltd.com/privacy-policy/',
};

const READER_TYPE = {
  QR: 1,
  NFC: 2,
};

export {
  DEFAULT_THEME,
  EVENT,
  FIELD,
  IS_EXPO,
  SECRET_TYPE,
  READER_TYPE,
  SECURE_TYPES,
  SHARD_TYPES,
  SATOSHI_URLS,
  STORAGE_DOMAIN,
  VAULTS_KEYWORDS,
  VAULT_TYPE,
};
