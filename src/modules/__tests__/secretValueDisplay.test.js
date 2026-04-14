import {
  buildCardValue,
  formatCardNumber,
  getMaskedCardValue,
  getSecretValueTokens,
  isCardCvv,
  isCardExpire,
  isCardNumber,
  isCardValue,
  maskSecret,
  normalizeCardCvv,
  normalizeCardExpire,
  normalizeCardNumber,
  parseCardValue,
} from '../secretValueDisplay';

describe('secretValueDisplay', () => {
  describe('isCardNumber', () => {
    it('accepts a 16-digit card number', () => expect(isCardNumber('4111111111111111')).toBe(true));
    it('accepts a 13-digit card number', () => expect(isCardNumber('4111111111111')).toBe(true));
    it('accepts a 19-digit card number', () => expect(isCardNumber('4111111111111111111')).toBe(true));
    it('rejects fewer than 13 digits', () => expect(isCardNumber('411111111111')).toBe(false));
    it('accepts numbers with spaces (treated as separators)', () => expect(isCardNumber('4111 1111 1111 1111')).toBe(true));
    it('rejects numbers with dashes', () => expect(isCardNumber('4111-1111-1111-1111')).toBe(false));
    it('rejects an empty string', () => expect(isCardNumber('')).toBe(false));
  });

  describe('isCardExpire', () => {
    it('accepts valid MM/YY', () => {
      expect(isCardExpire('01/25')).toBe(true);
      expect(isCardExpire('12/28')).toBe(true);
    });
    it('rejects month 00', () => expect(isCardExpire('00/25')).toBe(false));
    it('rejects month 13', () => expect(isCardExpire('13/25')).toBe(false));
    it('rejects missing slash', () => expect(isCardExpire('1225')).toBe(false));
    it('rejects dash separator', () => expect(isCardExpire('12-25')).toBe(false));
  });

  describe('isCardCvv', () => {
    it('accepts a 3-digit CVV', () => expect(isCardCvv('123')).toBe(true));
    it('accepts a 4-digit CVV (Amex)', () => expect(isCardCvv('1234')).toBe(true));
    it('rejects 2 digits', () => expect(isCardCvv('12')).toBe(false));
    it('rejects 5 digits', () => expect(isCardCvv('12345')).toBe(false));
    it('rejects non-digits', () => expect(isCardCvv('abc')).toBe(false));
  });

  describe('normalizeCardNumber', () => {
    it('strips spaces', () => expect(normalizeCardNumber('4111 1111 1111 1111')).toBe('4111111111111111'));
    it('strips dashes', () => expect(normalizeCardNumber('4111-1111-1111-1111')).toBe('4111111111111111'));
    it('truncates to 19 digits', () => expect(normalizeCardNumber('1'.repeat(25))).toHaveLength(19));
    it('leaves already-clean numbers unchanged', () => expect(normalizeCardNumber('4111111111111111')).toBe('4111111111111111'));
  });

  describe('normalizeCardExpire', () => {
    it('inserts slash after 2 digits', () => expect(normalizeCardExpire('1228')).toBe('12/28'));
    it('returns partial digits when fewer than 3', () => expect(normalizeCardExpire('12')).toBe('12'));
    it('leaves already-formatted expiry unchanged', () => expect(normalizeCardExpire('12/28')).toBe('12/28'));
    it('strips non-digit characters before formatting', () => expect(normalizeCardExpire('12-28')).toBe('12/28'));
  });

  describe('normalizeCardCvv', () => {
    it('returns digits unchanged for valid CVV', () => expect(normalizeCardCvv('123')).toBe('123'));
    it('caps at 4 digits', () => expect(normalizeCardCvv('12345')).toBe('1234'));
    it('strips non-digit characters', () => expect(normalizeCardCvv('1a2b3')).toBe('123'));
  });

  describe('buildCardValue', () => {
    it('builds a canonical pipe-separated card string from valid parts', () => {
      expect(buildCardValue('4111111111111111', '12/28', '123')).toBe('4111111111111111|12/28|123');
    });
    it('normalizes inputs before building', () => {
      expect(buildCardValue('4111 1111 1111 1111', '1228', '123')).toBe('4111111111111111|12/28|123');
    });
    it('returns undefined for an invalid card number', () => {
      expect(buildCardValue('123', '12/28', '123')).toBeUndefined();
    });
    it('returns undefined for an invalid expiry', () => {
      expect(buildCardValue('4111111111111111', '13/28', '123')).toBeUndefined();
    });
    it('returns undefined for an invalid CVV', () => {
      expect(buildCardValue('4111111111111111', '12/28', '12')).toBeUndefined();
    });
  });

  describe('parseCardValue', () => {
    it('parses a full canonical card string (number|expire|cvv)', () => {
      expect(parseCardValue('4111111111111111|12/28|123')).toEqual({
        canonical: '4111111111111111|12/28|123',
        number: '4111111111111111',
        expire: '12/28',
        cvv: '123',
      });
    });
    it('parses a card number only string', () => {
      expect(parseCardValue('4111111111111111')).toEqual({
        canonical: '4111111111111111',
        number: '4111111111111111',
      });
    });
    it('returns undefined for an empty string', () => {
      expect(parseCardValue('')).toBeUndefined();
    });
    it('returns undefined for a non-card value', () => {
      expect(parseCardValue('not-a-card')).toBeUndefined();
    });
    it('returns undefined for a short number', () => {
      expect(parseCardValue('12345')).toBeUndefined();
    });
  });

  describe('formatCardNumber', () => {
    it('groups digits into blocks of 4 separated by spaces', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    });
    it('formats a 13-digit card correctly', () => {
      expect(formatCardNumber('4111111111111')).toBe('4111 1111 1111 1');
    });
    it('handles a canonical card string by extracting the number', () => {
      expect(formatCardNumber('4111111111111111|12/28|123')).toBe('4111 1111 1111 1111');
    });
  });

  describe('getMaskedCardValue', () => {
    it('replaces all digits with asterisks in number, expire and cvv', () => {
      const masked = getMaskedCardValue('4111111111111111|12/28|123');
      expect(masked.number).toMatch(/^[\* ]+$/);
      expect(masked.expire).toBe('**/**.***'.slice(0, 5));
      expect(masked.cvv).toBe('***');
    });
    it('does not include expire or cvv when they are absent', () => {
      const masked = getMaskedCardValue('4111111111111111');
      expect(masked.expire).toBeUndefined();
      expect(masked.cvv).toBeUndefined();
    });
    it('returns undefined for an invalid card value', () => {
      expect(getMaskedCardValue('not-a-card')).toBeUndefined();
    });
  });

  describe('isCardValue', () => {
    it('returns true for a full canonical card string', () => {
      expect(isCardValue('4111111111111111|12/28|123')).toBe(true);
    });
    it('returns true for a card number only', () => {
      expect(isCardValue('4111111111111111')).toBe(true);
    });
    it('returns false for a non-card value', () => {
      expect(isCardValue('my-password')).toBe(false);
    });
    it('returns false for an empty string', () => {
      expect(isCardValue('')).toBe(false);
    });
  });

  describe('maskSecret', () => {
    it('replaces all non-whitespace characters with asterisks', () => {
      expect(maskSecret('hello world')).toBe('***** *****');
    });
    it('preserves whitespace positions', () => {
      expect(maskSecret('a b')).toBe('* *');
    });
    it('masks a password with no spaces', () => {
      expect(maskSecret('abc123')).toBe('******');
    });
    it('returns empty string for empty input', () => {
      expect(maskSecret('')).toBe('');
    });
  });

  describe('getSecretValueTokens', () => {
    it('splits into word and whitespace tokens', () => {
      expect(getSecretValueTokens('hello world')).toEqual(['hello', ' ', 'world']);
    });
    it('treats multiple spaces as a single whitespace token', () => {
      expect(getSecretValueTokens('a  b')).toEqual(['a', '  ', 'b']);
    });
    it('returns a single token for a value without spaces', () => {
      expect(getSecretValueTokens('password')).toEqual(['password']);
    });
    it('returns an empty array for an empty string', () => {
      expect(getSecretValueTokens('')).toEqual([]);
    });
  });
});
