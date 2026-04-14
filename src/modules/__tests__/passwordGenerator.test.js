import { QRParser } from '../QRParser';
import {
  clampConfig,
  generatePassword,
  getPasswordStrength,
  getSecretStrength,
  getTextStrength,
} from '../passwordGenerator';

describe('clampConfig', () => {
  it('returns defaults when called with no arguments', () => {
    expect(clampConfig()).toEqual({ capitals: 0, digits: 0, length: 14, symbols: 0 });
  });

  it('enforces a minimum length of 8', () => {
    expect(clampConfig({ length: 4 }).length).toBe(8);
  });

  it('keeps a length above the minimum unchanged', () => {
    expect(clampConfig({ length: 20 }).length).toBe(20);
  });

  it('clamps negative specials to 0', () => {
    const config = clampConfig({ capitals: -1, digits: -5, symbols: -3 });
    expect(config.capitals).toBe(0);
    expect(config.digits).toBe(0);
    expect(config.symbols).toBe(0);
  });

  it('expands length to fit specials that exceed the requested length', () => {
    const config = clampConfig({ length: 8, capitals: 5, digits: 5, symbols: 5 });
    expect(config.length).toBe(15);
  });

  it('keeps length when specials fit within it', () => {
    const config = clampConfig({ length: 14, capitals: 2, digits: 2, symbols: 2 });
    expect(config.length).toBe(14);
  });
});

describe('generatePassword', () => {
  it('produces a string of the requested length', () => {
    expect(generatePassword({ length: 16 })).toHaveLength(16);
  });

  it('uses the minimum length of 8 when not specified', () => {
    expect(generatePassword()).toHaveLength(14);
  });

  it('includes the requested number of digit characters', () => {
    const password = generatePassword({ length: 10, digits: 3 });
    const digitCount = (password.match(/\d/g) || []).length;
    expect(digitCount).toBe(3);
  });

  it('includes the requested number of uppercase characters', () => {
    const password = generatePassword({ length: 10, capitals: 4 });
    const capitalCount = (password.match(/[A-Z]/g) || []).length;
    expect(capitalCount).toBe(4);
  });

  it('includes the requested number of symbol characters', () => {
    const symbols = '!@#$%^&*()-_=+[]{};:,.?';
    const password = generatePassword({ length: 10, symbols: 2 });
    const symbolCount = password.split('').filter((c) => symbols.includes(c)).length;
    expect(symbolCount).toBe(2);
  });

  it('returns only lowercase when no specials are requested', () => {
    const password = generatePassword({ length: 12 });
    expect(password).toMatch(/^[a-z]+$/);
  });

  it('returns different values on successive calls (non-deterministic)', () => {
    const results = new Set(Array.from({ length: 10 }, () => generatePassword({ length: 16 })));
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('getTextStrength', () => {
  it('rates short passwords as weak', () => {
    expect(getTextStrength('abc')).toBe('weak');
  });

  it('rates a long mixed-case alphanumeric+symbol password as strong', () => {
    expect(getTextStrength('MyStr0ng@Pass!word')).toBe('strong');
  });

  it('rates an 8-char lowercase-only password as weak', () => {
    expect(getTextStrength('password')).toBe('weak');
  });

  it('rates a 16-char password with all four categories as strong', () => {
    expect(getTextStrength('Abcdefgh1!Abcde2')).toBe('strong');
  });

  it('coerces non-string values to string before evaluating', () => {
    expect(typeof getTextStrength(12345678)).toBe('string');
  });
});

describe('getPasswordStrength', () => {
  it('rates an all-lowercase short config as weak', () => {
    expect(getPasswordStrength({ length: 8 })).toBe('weak');
  });

  it('rates a long mixed config as veryStrong', () => {
    expect(getPasswordStrength({ length: 20, capitals: 4, digits: 4, symbols: 4 })).toBe('veryStrong');
  });

  it('rates a moderate config as strong', () => {
    expect(getPasswordStrength({ length: 10, capitals: 2, digits: 2 })).toBe('strong');
  });

  it('returns weak for length < 10 with fewer than 3 categories', () => {
    expect(getPasswordStrength({ length: 8, capitals: 2 })).toBe('weak');
  });
});

describe('getSecretStrength', () => {
  it('returns weak for an empty value', () => {
    expect(getSecretStrength()).toBe('weak');
    expect(getSecretStrength({ value: '' })).toBe('weak');
  });

  it('returns strong for seed phrase type (non-password strong)', () => {
    expect(getSecretStrength({ value: '4someencodedwords' })).toBe('strong');
  });

  it('returns strong for card type', () => {
    expect(getSecretStrength({ value: '7someencodedcard' })).toBe('strong');
  });

  it('returns strong for TOTP type', () => {
    expect(getSecretStrength({ value: 'Aencodedtotp' })).toBe('strong');
  });

  it('returns weak for PASSWORD_SECURE with short encoded value', () => {
    expect(getSecretStrength({ value: '2short' })).toBe('weak');
  });

  it('returns strong for PASSWORD_SECURE with encoded value >= 20 chars', () => {
    expect(getSecretStrength({ value: `2${'x'.repeat(20)}` })).toBe('strong');
  });

  it('rates an encoded weak password as weak', () => {
    const encoded = QRParser.encode('abc');
    expect(getSecretStrength({ value: encoded })).toBe('weak');
  });

  it('rates an encoded strong password as strong', () => {
    const encoded = QRParser.encode('MyStr0ng@Pass!word');
    expect(getSecretStrength({ value: encoded })).toBe('strong');
  });
});
