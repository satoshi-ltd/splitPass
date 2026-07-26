import { SECRET_TYPE } from '../../App.constants';
import { QRParser } from '../QRParser';
import { chars } from '../repositories/chars';
import { buildCardValue } from '../secretValueDisplay';

const buildLegacyPasswordShards = (qr, shares = 3) => {
  const groups = qr.slice(1).match(/.{2}/g) || [];

  return Array.from({ length: shares }, (_, share) => {
    const masked = groups.map((group, index) => ((share + index) % shares === 0 ? '00' : group));

    return `${SECRET_TYPE.PASSWORD_SHARD}${masked.join('')}`;
  });
};

const buildLegacySeedShards = (qr, shares = 3) => {
  const groups = qr.slice(1).match(/.{4}/g) || [];

  return Array.from({ length: shares }, (_, share) => {
    const masked = groups.map((group, index) => ((share + index) % shares === 0 ? '0000' : group));

    return `${SECRET_TYPE.SEED_PHRASE_SHARD}${masked.join('')}`;
  });
};

const encodeConfig = (value) => Array.from(value, (char) => String(chars.indexOf(char) + 1).padStart(2, '0')).join('');
const LEGACY_CARD_SEGMENTS = ['4111', '1111', '1111', '1111', '12', '29', '12', '3'];
const buildLegacyCardShards = (shares = 3) =>
  Array.from({ length: shares }, (_, share) => {
    const masked = LEGACY_CARD_SEGMENTS.map((seg, index) =>
      (share + index) % shares === 0 ? '_'.repeat(seg.length) : seg,
    );

    return `${SECRET_TYPE.CARD_SHARD}${encodeConfig(masked.join('|'))}`;
  });

describe('QRParser shards (Shamir GF256)', () => {
  describe('new secure format', () => {
    it('splits and recombines a password from any pair of shards', () => {
      const secret = 'wallet-Recovery-2026';
      const qr = QRParser.encode(secret);
      const shards = QRParser.split(qr);

      expect(shards).toHaveLength(3);
      shards.forEach((shard) => expect(shard[0]).toBe(SECRET_TYPE.PASSWORD_SHARD_V2));
      expect(QRParser.decode(QRParser.combine(shards[0], shards[1]))).toBe(secret);
      expect(QRParser.decode(QRParser.combine(shards[1], shards[2]))).toBe(secret);
      expect(QRParser.decode(QRParser.combine(shards[0], shards[2]))).toBe(secret);
    });

    it('splits and recombines a seed phrase', () => {
      const seed = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
      const qr = QRParser.encode(seed);
      const shards = QRParser.split(qr);

      shards.forEach((shard) => expect(shard[0]).toBe(SECRET_TYPE.SEED_PHRASE_SHARD_V2));
      expect(QRParser.decode(QRParser.combine(shards[1], shards[2]))).toBe(seed);
    });

    it('leaks nothing usable from a single shard', () => {
      const secret = 'wallet-Recovery-2026';
      const qr = QRParser.encode(secret);
      const [shard] = QRParser.split(qr);

      expect(QRParser.combine(shard)).not.toBe(qr);
      expect(QRParser.decode(QRParser.combine(shard))).not.toBe(secret);
    });

    it('does not split TOTP secrets', () => {
      const qr = QRParser.encode('otpauth://totp/Acme:me?secret=JBSWY3DPEHPK3PXP&issuer=Acme', { type: 'totp' });

      expect(QRParser.split(qr)).toEqual([]);
    });
  });

  describe('backward compatibility (old QR/NFC still read)', () => {
    it('still combines and decodes legacy masked password shards', () => {
      const secret = 'legacy2026pass';
      const qr = QRParser.encode(secret);
      const legacy = buildLegacyPasswordShards(qr);

      legacy.forEach((shard) => expect(shard[0]).toBe(SECRET_TYPE.PASSWORD_SHARD));
      expect(QRParser.decode(QRParser.combine(legacy[0], legacy[1]))).toBe(secret);
      expect(QRParser.decode(QRParser.combine(legacy[1], legacy[2]))).toBe(secret);
    });

    it('still combines and decodes legacy masked seed-phrase shards', () => {
      const seed = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
      const qr = QRParser.encode(seed);
      const legacy = buildLegacySeedShards(qr);

      legacy.forEach((shard) => expect(shard[0]).toBe(SECRET_TYPE.SEED_PHRASE_SHARD));
      expect(QRParser.decode(QRParser.combine(legacy[0], legacy[2]))).toBe(seed);
      expect(QRParser.decode(QRParser.combine(legacy[1], legacy[2]))).toBe(seed);
    });

    it('still combines and decodes legacy masked card shards', () => {
      const cardValue = buildCardValue('4111111111111111', '12/29', '123');
      const legacy = buildLegacyCardShards();

      legacy.forEach((shard) => expect(shard[0]).toBe(SECRET_TYPE.CARD_SHARD));
      expect(QRParser.combine(legacy[0], legacy[1])[0]).toBe(SECRET_TYPE.CARD);
      expect(QRParser.decode(QRParser.combine(legacy[0], legacy[1]))).toBe(cardValue);
      expect(QRParser.decode(QRParser.combine(legacy[1], legacy[2]))).toBe(cardValue);
    });
  });
});
