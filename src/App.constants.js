const DEFAULT_THEME = 'light';

const QR_TYPE = {
  PASSWORD: '1',
  PASSWORD_SECURE: '2',
  PASSWORD_SHARD: '3',
  SEED_PHRASE: '4',
  SEED_PHRASE_SECURE: '5',
  SEED_PHRASE_SHARD: '6',
};

const STEPS = {
  QR: 'qr',
  PIN: 'pin',
};

const STORAGE_DOMAIN = 'com.satoshi-ltd.secretqr';

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

export { DEFAULT_THEME, QR_TYPE, SATOSHI_URLS, STEPS, STORAGE_DOMAIN, VAULTS_KEYWORDS, VAULT_TYPE };
