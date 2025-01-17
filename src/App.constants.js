import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_THEME = 'light';

const EVENT = {
  NOTIFICATION: 'notification',
};

const FIELD = {
  NAME: { name: 'secret', placeholder: 'name...' },
  PASSCODE: { mask: true, name: 'passcode', keyboard: 'numeric', maxLength: 6, placeholder: 'passcode...' },
};

const IS_EXPO = Constants.appOwnership === 'expo';

const IS_WEB = Platform.OS === 'web';

const SECRET_TYPE = {
  PASSWORD: '1',
  PASSWORD_SECURE: '2',
  PASSWORD_SHARD: '3',
  SEED_PHRASE: '4',
  SEED_PHRASE_SECURE: '5',
  SEED_PHRASE_SHARD: '6',
};

const SECURE_TYPES = [SECRET_TYPE.PASSWORD_SECURE, SECRET_TYPE.SEED_PHRASE_SECURE];

const SHARD_TYPES = [SECRET_TYPE.PASSWORD_SHARD, SECRET_TYPE.SEED_PHRASE_SHARD];

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
  IS_WEB,
  SECRET_TYPE,
  READER_TYPE,
  SECURE_TYPES,
  SHARD_TYPES,
  SATOSHI_URLS,
  STORAGE_DOMAIN,
  VAULTS_KEYWORDS,
  VAULT_TYPE,
};
