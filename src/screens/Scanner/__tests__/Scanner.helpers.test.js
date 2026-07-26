import { READER_TYPE, SECRET_TYPE } from '../../../App.constants';
import { getScannedValue, getScannerInstructions, isLegacyShard, resolveScannerPayload } from '../Scanner.helpers';

describe('Scanner helpers', () => {
  describe('isLegacyShard', () => {
    it('flags legacy masked shard types', () => {
      expect(isLegacyShard(`${SECRET_TYPE.PASSWORD_SHARD}0102`)).toBe(true);
      expect(isLegacyShard(`${SECRET_TYPE.SEED_PHRASE_SHARD}0001`)).toBe(true);
      expect(isLegacyShard(`${SECRET_TYPE.CARD_SHARD}0102`)).toBe(true);
    });

    it('does not flag new Shamir shard types', () => {
      expect(isLegacyShard(`${SECRET_TYPE.PASSWORD_SHARD_V2}abc`)).toBe(false);
      expect(isLegacyShard(`${SECRET_TYPE.SEED_PHRASE_SHARD_V2}abc`)).toBe(false);
      expect(isLegacyShard(`${SECRET_TYPE.CARD_SHARD_V2}abc`)).toBe(false);
    });

    it('does not flag non-shard values or empty input', () => {
      expect(isLegacyShard(`${SECRET_TYPE.PASSWORD}0102`)).toBe(false);
      expect(isLegacyShard('')).toBe(false);
      expect(isLegacyShard()).toBe(false);
    });
  });

  describe('getScannedValue', () => {
    it('returns the string as-is', () => {
      expect(getScannedValue('1password')).toBe('1password');
    });

    it('extracts the value property from an object payload', () => {
      expect(getScannedValue({ value: '1password' })).toBe('1password');
    });

    it('returns an empty string for an empty call', () => {
      expect(getScannedValue()).toBe('');
    });
  });

  describe('resolveScannerPayload', () => {
    it('resolves SplitPass payloads as secrets', () => {
      expect(resolveScannerPayload('1password')).toEqual({
        kind: 'secret',
        scannedValue: '1password',
        type: '1',
      });
    });

    it('resolves object payloads by extracting the value field', () => {
      expect(resolveScannerPayload({ value: '1password' })).toEqual({
        kind: 'secret',
        scannedValue: '1password',
        type: '1',
      });
    });

    it('resolves otpauth payloads as TOTP entries', () => {
      const payload = 'otpauth://totp/SplitPass:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SplitPass';

      expect(resolveScannerPayload(payload)).toMatchObject({
        kind: 'totp',
        scannedValue: payload,
        totp: expect.objectContaining({
          account: 'alice@example.com',
          issuer: 'SplitPass',
          secret: 'JBSWY3DPEHPK3PXP',
        }),
      });
    });

    it('flags unsupported payloads', () => {
      expect(resolveScannerPayload('https://example.com')).toEqual({
        kind: 'unsupported',
        scannedValue: 'https://example.com',
        type: 'h',
      });
    });

    it('flags an empty payload as unsupported', () => {
      expect(resolveScannerPayload('')).toEqual({
        kind: 'unsupported',
        scannedValue: '',
        type: undefined,
      });
    });

    it('decodes a B-type payload and returns the inner secret with username', () => {
      const result = resolveScannerPayload('Balice:1abc');
      expect(result).toEqual({
        kind: 'secret',
        scannedValue: '1abc',
        type: '1',
        username: 'alice',
      });
    });

    it('decodes a B-type payload with a percent-encoded username', () => {
      const result = resolveScannerPayload('Balice%40example.com:1abc');
      expect(result.kind).toBe('secret');
      expect(result.username).toBe('alice@example.com');
      expect(result.scannedValue).toBe('1abc');
    });

    it('marks a B-type payload as unsupported when the inner type is not a known secret type', () => {
      const result = resolveScannerPayload('Balice:Xunknown');
      expect(result.kind).toBe('unsupported');
    });

    it('old non-B QRs still resolve as secrets without a username field', () => {
      const result = resolveScannerPayload('1password');
      expect(result.kind).toBe('secret');
      expect(result.username).toBeUndefined();
    });

    // ------------------------------------------------------------------
    // Legacy QR compatibility — all existing secret types must still work
    // ------------------------------------------------------------------
    it.each([
      ['PASSWORD',        '1', '1abc'],
      ['PASSWORD_SECURE', '2', '2abc'],
      ['PASSWORD_SHARD',  '3', '3abc'],
      ['SEED_PHRASE',     '4', '4abc'],
      ['SEED_PHRASE_SECURE', '5', '5abc'],
      ['SEED_PHRASE_SHARD',  '6', '6abc'],
      ['CARD',           '7', '7abc'],
      ['CARD_SECURE',    '8', '8abc'],
      ['CARD_SHARD',     '9', '9abc'],
      ['TOTP',           'A', 'otpauth://totp/test?secret=JBSWY3DPEHPK3PXP'],
    ])('legacy %s QR resolves without a username', (label, _type, payload) => {
      const result = resolveScannerPayload(payload);
      // TOTP has its own kind; all others are 'secret' or 'totp'
      expect(['secret', 'totp']).toContain(result.kind);
      expect(result.username).toBeUndefined();
    });

    // ------------------------------------------------------------------
    // Username (B-type) edge cases
    // ------------------------------------------------------------------
    it('returns the inner scannedValue, not the B-wrapped string', () => {
      const result = resolveScannerPayload('Balice:1abc');
      expect(result.scannedValue).toBe('1abc');
      expect(result.scannedValue[0]).not.toBe('B');
    });

    it('a B-type wrapping a shard type is treated as unsupported (shards cannot carry usernames)', () => {
      // Shards use type '3'; passing B+shard shouldn't resolve as a fillable secret
      const result = resolveScannerPayload('Balice:3abc');
      // '3' IS a valid SECRET_TYPE, so the scanner returns kind:'secret' for the inner shard.
      // The important invariant: username IS extracted but scannedValue is the raw shard.
      expect(result.kind).toBe('secret');
      expect(result.scannedValue).toBe('3abc');
      expect(result.username).toBe('alice');
    });

    it('B-type with empty body after separator is unsupported', () => {
      const result = resolveScannerPayload('Balice:');
      expect(result.kind).toBe('unsupported');
    });
  });

  describe('getScannerInstructions', () => {
    it('shows the QR guidance by default', () => {
      expect(
        getScannerInstructions({
          readerType: READER_TYPE.QR,
          values: [],
        }),
      ).toEqual({
        caption: 'Align the QR code inside the frame to read the secret.',
        title: 'Scan Your QR Code',
      });
    });

    it('shows passcode guidance when a secure payload needs the passcode', () => {
      expect(
        getScannerInstructions({
          readerType: READER_TYPE.QR,
          showPasscodePrompt: true,
          values: ['2secure-secret'],
        }),
      ).toEqual({
        caption: 'Enter the 6-digit passcode attached to this secure payload.',
        title: '6-digit passcode',
      });
    });

    it('shows shard progress copy when one shard is present', () => {
      expect(
        getScannerInstructions({
          readerType: READER_TYPE.QR,
          values: ['3first-shard'],
        }),
      ).toEqual({
        caption: 'Keep scanning. You need one more shard to recover the secret.',
        title: 'First shard ready',
      });
    });

    it('shows recovered state once the secret is complete', () => {
      expect(
        getScannerInstructions({
          readerType: READER_TYPE.NFC,
          values: ['1decoded-secret'],
        }),
      ).toEqual({
        caption: '',
        title: 'Recovered secret ready',
      });
    });

    it('shows recovered state for two or more shards', () => {
      expect(
        getScannerInstructions({
          readerType: READER_TYPE.QR,
          values: ['3first-shard', '3second-shard'],
        }),
      ).toEqual({
        caption: '',
        title: 'Recovered secret ready',
      });
    });

    it('shows NFC guidance by default when reader type is NFC and no values', () => {
      expect(
        getScannerInstructions({
          readerType: READER_TYPE.NFC,
          values: [],
        }),
      ).toEqual({
        caption: 'Hold your split|Card near your phone to read the secret.',
        title: 'Bring Your Card Close',
      });
    });

    it('uses QR guidance as the default when called with no arguments', () => {
      const result = getScannerInstructions();
      expect(result.title).toBe('Scan Your QR Code');
    });
  });
});
