import { READER_TYPE } from '../../../App.constants';
import { getScannerInstructions, resolveScannerPayload } from '../Scanner.helpers';

describe('Scanner helpers', () => {
  describe('resolveScannerPayload', () => {
    it('resolves SplitPass payloads as secrets', () => {
      expect(resolveScannerPayload('1password')).toEqual({
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
        caption: 'Reveal it to verify the value, then save it to this device if needed.',
        title: 'Recovered secret ready',
      });
    });
  });
});
