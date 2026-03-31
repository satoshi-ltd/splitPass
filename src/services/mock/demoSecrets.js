import {
  createCardSecret,
  createCardShardSecrets,
  createLegacySecureCardSecret,
  createLegacySecureSecret,
  createShardSecrets,
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
  { ...createWebsiteSecret('satoshi@gmail.com', 'gmail.com', 'gmail-session-2026!'), favorite: true },
  createWebsiteSecret('ops@satoshi.com', 'google.com', 'ops-google-2026!'),
  createWebsiteSecret('satoshi@proton.me', 'proton.me', 'gmail-session-proton-2026!'),
  createWebsiteSecret('satoshi.fb', 'facebook.com', 'facebook-session-2026!'),
  createWebsiteSecret('satoshi.ig', 'instagram.com', 'instagram-session-2026!'),
  createWebsiteSecret('satoshi.reddit', 'reddit.com', 'reddit-session-2026!'),
  createWebsiteSecret('satoshi.discord', 'discord.com', 'discord-session-2026!'),
  createWebsiteSecret('satoshi.telegram', 'telegram.org', 'telegram-session-2026!'),
  createWebsiteSecret('satoshi.linkedin', 'linkedin.com', 'linkedin-session-2026!'),
  createWebsiteSecret('@satoshi', 'x.com', 'x-session-2026!'),
  createWebsiteSecret('@satoshi', 'twitter.com', 'twitter-session-2026!'),
  createWebsiteSecret('AWS Console', 'aws.amazon.com', 'aws-console-demo-2026!'),
  createWebsiteSecret('Apple ID', 'apple.com', 'appleid-demo-2026!'),
  { ...createWebsiteSecret('GitHub', 'github.com', 'github-demo-2026!'), favorite: true },
  { ...createWebsiteSecret('Bitwarden Vault', 'bitwarden.com', 'bitwarden-vault-2026!'), favorite: true },
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
  createWebsiteSecret('Google Workspace', 'google.com', 'workspace-2026!'),
  createWebsiteSecret('Meta Ads', 'facebook.com', 'meta-ads-2026!'),
  createWebsiteSecret('X Pro', 'twitter.com', 'xpro-2026!'),
  createWebsiteSecret('AWS Root', 'aws.amazon.com', 'aws-root-2026!'),
  createWebsiteSecret('Netflix Family', 'netflix.com', 'netflix-family-2026!'),
  createWebsiteSecret('Spotify Family', 'spotify.com', 'spotify-family-2026!'),
  createWebsiteSecret('YouTube Premium', 'youtube.com', 'youtube-premium-2026!'),
  createWebsiteSecret('Dropbox', 'dropbox.com', 'dropbox-demo-2026!'),
  createWebsiteSecret('Notion', 'notion.so', 'notion-demo-2026!'),
  createWebsiteSecret('Figma', 'figma.com', 'figma-demo-2026!'),
  createWebsiteSecret('Canva', 'canva.com', 'canva-demo-2026!'),
  createWebsiteSecret('Zoom', 'zoom.us', 'zoom-demo-2026!'),
  createWebsiteSecret('PayPal Personal', 'paypal.com', 'paypal-personal-2026!'),
  createWebsiteSecret('PayPal Business', 'paypal.com', 'paypal-business-2026!'),
  { ...createWebsiteSecret('Stripe Dashboard', 'stripe.com', 'stripe-dashboard-2026!'), favorite: true },
  createWebsiteSecret('Wise Personal', 'wise.com', 'wise-personal-2026!'),
  createWebsiteSecret('Revolut Business', 'revolut.com', 'revolut-business-2026!'),
  createWebsiteSecret('Coinbase Vault', 'coinbase.com', 'coinbase-vault-2026!'),
  createWebsiteSecret('Binance Account', 'binance.com', 'binance-account-2026!'),
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
  createWebsiteSecret('Ledger Live', 'ledger.com', 'ledger-live-2026!'),
  createWebsiteSecret('Trezor Suite', 'trezor.io', 'trezor-suite-2026!'),
  createWebsiteSecret('Coldcard', 'coldcard.com', 'coldcard-app-2026!'),
  createWebsiteSecret('SeedSigner', 'seedsigner.com', 'seedsigner-app-2026!'),
];

const getLegacySecureDemoSecrets = () => [
  createLegacySecureSecret('Legacy Proton Secure', 'proton.me', 'gmail-session-secure-2026!'),
  createLegacySecureSecret('Legacy Bitwarden Secure', 'bitwarden.com', 'bitwarden-secure-2026!'),
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
