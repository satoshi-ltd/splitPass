const DEFAULT_THEME = 'light';

const FIELD = {
  NAME: { name: 'secret', placeholder: 'name...' },
  PASSCODE: { name: 'passcode', keyboard: 'numeric', maxLength: 6, placeholder: 'passcode...', secureTextEntry: true },
};

const QR_TYPE = {
  PASSWORD: '1',
  PASSWORD_SECURE: '2',
  PASSWORD_SHARD: '3',
  SEED_PHRASE: '4',
  SEED_PHRASE_SECURE: '5',
  SEED_PHRASE_SHARD: '6',
};

const SECURE_TYPES = [QR_TYPE.PASSWORD_SECURE, QR_TYPE.SEED_PHRASE_SECURE];

const SHARD_TYPES = [QR_TYPE.PASSWORD_SHARD, QR_TYPE.SEED_PHRASE_SHARD];

const STEPS = {
  QR: 'qr',
  PIN: 'pin',
};

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

export {
  DEFAULT_THEME,
  FIELD,
  QR_TYPE,
  SECURE_TYPES,
  SHARD_TYPES,
  SATOSHI_URLS,
  STEPS,
  STORAGE_DOMAIN,
  VAULTS_KEYWORDS,
  VAULT_TYPE,
};
