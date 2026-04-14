import {
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
} from './helpers';
import { QRParser } from '../../modules';

const getSessionDemoSecrets = () => [
  { ...createWebsiteSecret('satoshi@gmail.com', 'gmail.com', 'gmail-session-2026!', 'satoshi@gmail.com'), favorite: true },
  createWebsiteSecret('ops@satoshi.com', 'google.com', 'ops-google-2026!', 'ops@satoshi.com'),
  createTOTPSecret('Google 2FA', 'google.com', {
    account: 'satoshi@gmail.com',
    issuer: 'Google',
    secret: 'JBSWY3DPEHPK3PXQ',
  }),
  createWebsiteSecret('satoshi@proton.me', 'proton.me', 'gmail-session-proton-2026!', 'satoshi@proton.me'),
  createWebsiteSecret('satoshi.fb', 'facebook.com', 'facebook-session-2026!', 'satoshi.fb'),
  createWebsiteSecret('satoshi.ig', 'instagram.com', 'instagram-session-2026!', 'satoshi.ig'),
  createWebsiteSecret('satoshi.reddit', 'reddit.com', 'reddit-session-2026!', 'satoshi.reddit'),
  createWebsiteSecret('satoshi.discord', 'discord.com', 'discord-session-2026!', 'satoshi.discord'),
  createWebsiteSecret('satoshi.telegram', 'telegram.org', 'telegram-session-2026!', 'satoshi.telegram'),
  createWebsiteSecret('satoshi.linkedin', 'linkedin.com', 'linkedin-session-2026!', 'satoshi.linkedin'),
  createWebsiteSecret('@satoshi', 'x.com', 'x-session-2026!', '@satoshi'),
  createWebsiteSecret('@satoshi', 'twitter.com', 'twitter-session-2026!', '@satoshi'),
  createWebsiteSecret('AWS Console', 'aws.amazon.com', 'aws-console-demo-2026!', 'ops@satoshi.com'),
  createWebsiteSecret('Apple ID', 'apple.com', 'appleid-demo-2026!', 'satoshi@icloud.com'),
  { ...createWebsiteSecret('GitHub', 'github.com', 'github-demo-2026!', 'satoshi'), favorite: true },
  { ...createWebsiteSecret('Bitwarden Vault', 'bitwarden.com', 'bitwarden-vault-2026!', 'satoshi@proton.me'), favorite: true },
];

const getSeedDemoSecrets = () => [
  {
    name: 'Seed 12',
    value: QRParser.encode(SEED_12_A),
    website: 'trezor.io',
  },
  {
    name: 'Seed 12 Backup',
    value: QRParser.encode(SEED_12_B),
    website: 'ledger.com',
  },
  {
    name: 'Seed 24',
    value: QRParser.encode(SEED_24_A),
    website: 'coldcard.com',
  },
  {
    name: 'Seed 24 Backup',
    value: QRParser.encode(SEED_24_B),
    website: 'foundation.xyz',
  },
  ...createShardSecrets('Seed 12 Shard', 'seedsigner.com', SEED_12_A),
  ...createShardSecrets('Seed 24 Shard', 'passport.xyz', SEED_24_C),
];

const getPrimaryDemoSecrets = () => [
  createWebsiteSecret('Google Workspace', 'google.com', 'workspace-2026!', 'admin@satoshi.com'),
  createWebsiteSecret('Meta Ads', 'facebook.com', 'meta-ads-2026!', 'ads@satoshi.com'),
  createTOTPSecret('AWS Root 2FA', 'aws.amazon.com', {
    account: 'root@satoshi.com',
    issuer: 'Amazon',
    period: 30,
    secret: 'JBSWY3DPEHPK3PXR',
  }),
  createWebsiteSecret('X Pro', 'twitter.com', 'xpro-2026!', '@satoshi'),
  createWebsiteSecret('AWS Root', 'aws.amazon.com', 'aws-root-2026!', 'root@satoshi.com'),
  createWebsiteSecret('Netflix Family', 'netflix.com', 'netflix-family-2026!', 'family@satoshi.com'),
  createWebsiteSecret('Spotify Family', 'spotify.com', 'spotify-family-2026!', 'satoshi@proton.me'),
  createWebsiteSecret('YouTube Premium', 'youtube.com', 'youtube-premium-2026!', 'satoshi@gmail.com'),
  createWebsiteSecret('Dropbox', 'dropbox.com', 'dropbox-demo-2026!', 'satoshi@gmail.com'),
  createTOTPSecret('GitHub 2FA', 'github.com', {
    account: 'satoshi',
    issuer: 'GitHub',
    secret: 'JBSWY3DPEHPK3PXP',
  }),
  createTOTPSecret('Stripe 2FA', 'stripe.com', {
    account: 'ops@satoshi.com',
    issuer: 'Stripe',
    period: 30,
    secret: 'JBSWY3DPEHPK3PXS',
  }),
  createWebsiteSecret('Notion', 'notion.so', 'notion-demo-2026!', 'satoshi@proton.me'),
  createWebsiteSecret('Figma', 'figma.com', 'figma-demo-2026!', 'design@satoshi.com'),
  createWebsiteSecret('Canva', 'canva.com', 'canva-demo-2026!', 'design@satoshi.com'),
  createWebsiteSecret('Zoom', 'zoom.us', 'zoom-demo-2026!', 'satoshi@proton.me'),
  createWebsiteSecret('PayPal Personal', 'paypal.com', 'paypal-personal-2026!', 'satoshi@gmail.com'),
  createWebsiteSecret('PayPal Business', 'paypal.com', 'paypal-business-2026!', 'billing@satoshi.com'),
  { ...createWebsiteSecret('Stripe Dashboard', 'stripe.com', 'stripe-dashboard-2026!', 'ops@satoshi.com'), favorite: true },
  createWebsiteSecret('Wise Personal', 'wise.com', 'wise-personal-2026!', 'satoshi@gmail.com'),
  createWebsiteSecret('Revolut Business', 'revolut.com', 'revolut-business-2026!', 'finance@satoshi.com'),
  createWebsiteSecret('Coinbase Vault', 'coinbase.com', 'coinbase-vault-2026!', 'satoshi@gmail.com'),
  createWebsiteSecret('Binance Account', 'binance.com', 'binance-account-2026!', 'satoshi@gmail.com'),
  createCardSecret('Visa Personal', 'visa.com', '4111111111111111', '12/29', '123', { brand: 'visa' }),
  createCardSecret('Master Card Corp', 'mastercard.com', '5555555555554444', '07/30', '456', {
    brand: 'mastercard',
  }),
  createCardSecret('Bank Debit', 'bank.com', '4242424242424242', '03/31', '321', { brand: 'card' }),
  {
    name: 'Ledger Nano',
    value: QRParser.encode('ledgernano-2026!'),
    website: 'ledger.com',
  },
  createWebsiteSecret('Ledger Live', 'ledger.com', 'ledger-live-2026!', 'satoshi@proton.me'),
  createWebsiteSecret('Trezor Suite', 'trezor.io', 'trezor-suite-2026!', 'satoshi@proton.me'),
  createWebsiteSecret('Coldcard', 'coldcard.com', 'coldcard-app-2026!', 'satoshi@proton.me'),
  createWebsiteSecret('SeedSigner', 'seedsigner.com', 'seedsigner-app-2026!', 'satoshi@proton.me'),
];

const getLegacySecureDemoSecrets = () => [
  createLegacySecureSecret('Legacy Proton Secure', 'proton.me', 'gmail-session-secure-2026!', MOCK_PASSCODE, 'satoshi@proton.me'),
  createLegacySecureSecret('Legacy Bitwarden Secure', 'bitwarden.com', 'bitwarden-secure-2026!', MOCK_PASSCODE, 'satoshi@proton.me'),
  createLegacySecureCardSecret(
    'Legacy Master Card Secure',
    'mastercard.com',
    '5555555555554444',
    '07/30',
    '456',
    MOCK_PASSCODE,
    {
      brand: 'mastercard',
    },
  ),
  {
    name: 'Legacy Seed 12 Secure',
    value: encodeSecret(SEED_12_B, MOCK_PASSCODE),
    website: 'ledger.com',
  },
];

const getShardDemoSecrets = () => [
  ...createShardSecrets('satoshi@gmail.com Shard', 'gmail.com', 'gmail-session-shard-2026!'),
  ...createShardSecrets('Stripe Dashboard Shard', 'stripe.com', 'stripe-dashboard-shard-2026!'),
  ...createCardShardSecrets('Visa Backup Shard', 'visa.com', '4111111111111111', '12/29', '123', { brand: 'visa' }),
];

const getDemoSecrets = () => [
  ...getSessionDemoSecrets(),
  ...getSeedDemoSecrets(),
  ...getPrimaryDemoSecrets(),
  ...getLegacySecureDemoSecrets(),
  ...getShardDemoSecrets(),
];

export { getDemoSecrets };
