import { SECRET_TYPE } from '../../App.constants';
import { QRParser } from '../QRParser';
import { buildTOTPURI, getTOTPCode, getTOTPRemainingSeconds, isTOTPURI, parseTOTPURI } from '../totp';

describe('totp uri parsing', () => {
  it('parses a standard otpauth uri with defaults and metadata', () => {
    const uri = 'otpauth://totp/GitHub:satoshi?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';

    expect(parseTOTPURI(uri)).toEqual({
      account: 'satoshi',
      algorithm: 'SHA1',
      digits: 6,
      issuer: 'GitHub',
      period: 30,
      secret: 'JBSWY3DPEHPK3PXP',
    });
    expect(isTOTPURI(uri)).toBe(true);
  });

  it('rejects hotp and missing secrets', () => {
    expect(parseTOTPURI('otpauth://hotp/GitHub:satoshi?secret=JBSWY3DPEHPK3PXP')).toBeUndefined();
    expect(parseTOTPURI('otpauth://totp/GitHub:satoshi?issuer=GitHub')).toBeUndefined();
  });
});

describe('totp runtime', () => {
  it('generates RFC-compatible SHA1 codes', async () => {
    const uri = buildTOTPURI({
      account: 'alice@example.com',
      digits: 8,
      issuer: 'Example',
      secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
    });

    await expect(getTOTPCode(uri, 59000)).resolves.toBe('94287082');
    await expect(getTOTPCode(uri, 1111111109000)).resolves.toBe('07081804');
  });

  it('supports SHA256 and SHA512', async () => {
    const sha256 = buildTOTPURI({
      account: 'alice@example.com',
      algorithm: 'SHA256',
      digits: 8,
      issuer: 'Example',
      secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZA====',
    });
    const sha512 = buildTOTPURI({
      account: 'alice@example.com',
      algorithm: 'SHA512',
      digits: 8,
      issuer: 'Example',
      secret:
        'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNA=',
    });

    await expect(getTOTPCode(sha256, 59000)).resolves.toBe('46119246');
    await expect(getTOTPCode(sha512, 59000)).resolves.toBe('90693936');
  });

  it('tracks remaining seconds in the active period', () => {
    const uri = buildTOTPURI({
      account: 'alice@example.com',
      issuer: 'Example',
      secret: 'JBSWY3DPEHPK3PXP',
    });

    expect(getTOTPRemainingSeconds(uri, 0)).toBe(30);
    expect(getTOTPRemainingSeconds(uri, 29000)).toBe(1);
    expect(getTOTPRemainingSeconds(uri, 30000)).toBe(30);
  });
});

describe('qr parser totp support', () => {
  it('round-trips splitpass totp qr values', () => {
    const uri = buildTOTPURI({
      account: 'satoshi',
      issuer: 'GitHub',
      secret: 'JBSWY3DPEHPK3PXP',
    });
    const qr = QRParser.encode(uri, { type: 'totp' });

    expect(qr[0]).toBe(SECRET_TYPE.TOTP);
    expect(QRParser.decode(qr)).toBe(uri);
  });

  it('does not shard totp values', () => {
    const uri = buildTOTPURI({
      account: 'satoshi',
      issuer: 'GitHub',
      secret: 'JBSWY3DPEHPK3PXP',
    });
    const qr = QRParser.encode(uri, { type: 'totp' });

    expect(QRParser.split(qr)).toEqual([]);
  });
});
