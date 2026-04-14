import { READER_TYPE } from '../../../App.constants';
import { getScannedValue, getScannerInstructions, resolveScannerPayload } from '../Scanner.helpers';

describe('Scanner helpers', () => {
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
