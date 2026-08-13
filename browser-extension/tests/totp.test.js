/**
 * @jest-environment node
 */

require('../lib/totp.js');

const { generateTOTP, isTotpUri } = globalThis.SplitPassTotp;

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const toBase32 = (ascii = '') => {
  let bits = '';
  let output = '';

  for (const char of ascii) bits += char.charCodeAt(0).toString(2).padStart(8, '0');
  for (let index = 0; index + 5 <= bits.length; index += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(index, index + 5), 2)];
  }

  const remainder = bits.length % 5;
  if (remainder) output += BASE32_ALPHABET[parseInt(bits.slice(bits.length - remainder).padEnd(5, '0'), 2)];

  return output;
};

const uri = ({ algorithm, digits = 8, secret }) =>
  `otpauth://totp/SplitPass:rfc?secret=${toBase32(secret)}&algorithm=${algorithm}&digits=${digits}&period=30`;

// RFC 6238 appendix B, T = 59 s.
const RFC_CASES = [
  ['SHA1', '12345678901234567890', '94287082'],
  ['SHA256', '12345678901234567890123456789012', '46119246'],
  ['SHA512', '1234567890123456789012345678901234567890123456789012345678901234', '90693936'],
];

describe('extension TOTP', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(59 * 1000));
  afterEach(() => Date.now.mockRestore());

  it.each(RFC_CASES)('matches the RFC 6238 vector for %s', async (algorithm, secret, expected) => {
    await expect(generateTOTP(uri({ algorithm, secret }))).resolves.toBe(expected);
  });

  it('falls back to SHA1 when the URI omits the algorithm', async () => {
    const secret = toBase32('12345678901234567890');

    await expect(generateTOTP(`otpauth://totp/SplitPass:rfc?secret=${secret}&digits=8&period=30`)).resolves.toBe(
      '94287082',
    );
  });

  it('keeps the digit count the app wrote instead of clamping it', async () => {
    const [, secret] = RFC_CASES[0];

    await expect(generateTOTP(uri({ algorithm: 'SHA1', digits: 10, secret }))).resolves.toHaveLength(10);
    await expect(generateTOTP(uri({ algorithm: 'SHA1', digits: 6, secret }))).resolves.toHaveLength(6);
  });

  it('recognises TOTP URIs', () => {
    expect(isTotpUri('otpauth://totp/SplitPass:rfc?secret=AAAA')).toBe(true);
    expect(isTotpUri('https://example.com')).toBe(false);
  });
});
