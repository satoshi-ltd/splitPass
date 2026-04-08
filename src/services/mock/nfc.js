import {
  createCardSecret,
  createCardShardSecrets,
  createLegacySecureCardSecret,
  encodeSecret,
  MOCK_PASSCODE,
  SEED_12_A,
  SEED_24_A,
  SEED_24_B,
} from './helpers';
import { QRParser } from '../../modules';

const DEV_PASSWORD_SHARDS = QRParser.split(QRParser.encode('gmail-session-shard-2026!'));
const DEV_STRIPE_SHARDS = QRParser.split(QRParser.encode('stripe-dashboard-shard-2026!'));
const DEV_SEED_12_SHARDS = QRParser.split(QRParser.encode(SEED_12_A));
const DEV_SEED_24_SHARDS = QRParser.split(QRParser.encode(SEED_24_A));
const DEV_VISA_CARD_SHARDS = createCardShardSecrets(
  'Visa Backup Shard',
  'visa.com',
  '4111111111111111',
  '12/29',
  '123',
  {
    brand: 'visa',
  },
);

const NFC_MOCK_TAG = {
  info: { id: 'dev-splitcard', name: 'SATOSHI LTD.', totalMemory: 504, usedMemory: 248 },
  records: [
    { name: 'satoshi@gmail.com', value: QRParser.encode('gmail-session-2026!') },
    { name: '@satoshi', value: QRParser.encode('facebook-session-2026!') },
    createCardSecret('Visa Personal', 'visa.com', '4111111111111111', '12/29', '123', { brand: 'visa' }),
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
    { name: 'satoshi@gmail.com Shard 1', value: DEV_PASSWORD_SHARDS[0] },
    { name: 'satoshi@gmail.com Shard 2', value: DEV_PASSWORD_SHARDS[1] },
    { name: 'Stripe Dashboard Shard 1', value: DEV_STRIPE_SHARDS[0] },
    DEV_VISA_CARD_SHARDS[0],
    DEV_VISA_CARD_SHARDS[1],
    { name: 'Seed 12', value: QRParser.encode(SEED_12_A) },
    { name: 'Legacy Seed 12 Secure', value: encodeSecret(SEED_12_A, MOCK_PASSCODE) },
    { name: 'Seed 12 Shard 1', value: DEV_SEED_12_SHARDS[0] },
    { name: 'Seed 12 Shard 2', value: DEV_SEED_12_SHARDS[1] },
    { name: 'Seed 24', value: QRParser.encode(SEED_24_A) },
    { name: 'Legacy Seed 24 Secure', value: encodeSecret(SEED_24_B, MOCK_PASSCODE) },
    { name: 'Seed 24 Shard 1', value: DEV_SEED_24_SHARDS[0] },
    { name: 'Seed 24 Shard 2', value: DEV_SEED_24_SHARDS[1] },
  ],
};

const buildNfcMockWrittenTag = ({ name, notes, value, username } = {}) => {
  const newRecord = { name, notes, value, username };
  const records = NFC_MOCK_TAG.records.some(
    (record) =>
      record.name === name && record.notes === notes && record.value === value && record.username === username,
  )
    ? NFC_MOCK_TAG.records
    : [...NFC_MOCK_TAG.records, newRecord];

  return {
    ...NFC_MOCK_TAG,
    info: {
      ...NFC_MOCK_TAG.info,
      usedMemory: Math.min(NFC_MOCK_TAG.info.totalMemory, NFC_MOCK_TAG.info.usedMemory + 28),
    },
    records,
  };
};

export { buildNfcMockWrittenTag, NFC_MOCK_TAG };
