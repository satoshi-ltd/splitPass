import { SECRET_TYPE } from '../../App.constants';
import { QRParser } from '../QRParser';
import { getSecretStrength, getTextStrength } from '../passwordGenerator';

describe('getTextStrength', () => {
  it('marks long mixed passwords as strong', () => {
    expect(getTextStrength('dChz3@t6Nd3G#8K$')).toBe('strong');
  });

  it('marks short or low-variety passwords as weak', () => {
    expect(getTextStrength('password')).toBe('weak');
    expect(getTextStrength('Passw0rd')).toBe('weak');
    expect(getTextStrength('abc12345')).toBe('weak');
  });
});

describe('getSecretStrength', () => {
  it('evaluates normal password secrets from their decoded value', () => {
    const strongPassword = QRParser.encode('dChz3@t6Nd3G#8K$');
    const weakPassword = QRParser.encode('password');

    expect(strongPassword[0]).toBe(SECRET_TYPE.PASSWORD);
    expect(getSecretStrength({ value: strongPassword })).toBe('strong');
    expect(getSecretStrength({ value: weakPassword })).toBe('weak');
  });

  it('treats shard, seed, card, and totp secrets as strong by default', () => {
    const seed = QRParser.encode('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    const totp = QRParser.encode('otpauth://totp/GitHub:satoshi?secret=JBSWY3DPEHPK3PXP&issuer=GitHub', { type: 'totp' });

    expect(getSecretStrength({ value: seed })).toBe('strong');
    expect(getSecretStrength({ value: totp })).toBe('strong');
    expect(getSecretStrength({ value: `${SECRET_TYPE.PASSWORD_SHARD}001122` })).toBe('strong');
  });
});
