const DEFAULT_THEME = 'light';

const QR_TYPE = {
  PASSWORD: '1',
  PASSWORD_ENCRYPTED: '2',
  SEED_PHRASE: '3',
  SEED_PHRASE_ENCRYPTED: '4',
  // PASSWORD_SPLIT: '5',
  // SEED_PHRASE_SPLIT: '6',
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

export {
  //
  DEFAULT_THEME,
  QR_TYPE,
  STEPS,
  STORAGE_DOMAIN,
  VAULTS_KEYWORDS,
  VAULT_TYPE,
};
