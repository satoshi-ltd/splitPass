import { Cypher } from '../cypher';

describe('Cypher', () => {
  describe('encrypt', () => {
    it('shifts each digit by the corresponding PIN digit mod 10', () => {
      expect(Cypher.encrypt('12345', '100000')).toBe('22345');
    });

    it('wraps around 10 when the sum exceeds 9', () => {
      expect(Cypher.encrypt('9', '100000')).toBe('0');
      expect(Cypher.encrypt('95', '190000')).toBe('04');
    });

    it('cycles the PIN across digits longer than 6', () => {
      // PIN '100000' repeats: positions 0 and 6 both add 1, others add 0
      expect(Cypher.encrypt('1000001', '100000')).toBe('2000002');
    });

    it('returns undefined for non-digit value', () => {
      expect(Cypher.encrypt('abc', '100000')).toBeUndefined();
    });

    it('returns undefined for a PIN shorter than 6 digits', () => {
      expect(Cypher.encrypt('123', '12345')).toBeUndefined();
    });

    it('returns undefined for a PIN longer than 6 digits', () => {
      expect(Cypher.encrypt('123', '1234567')).toBeUndefined();
    });

    it('returns undefined for a non-string value', () => {
      expect(Cypher.encrypt(123, '100000')).toBeUndefined();
    });

    it('returns undefined for a non-string PIN', () => {
      expect(Cypher.encrypt('123', 100000)).toBeUndefined();
    });
  });

  describe('decrypt', () => {
    it('shifts each digit back by the corresponding PIN digit mod 10', () => {
      expect(Cypher.decrypt('22345', '100000')).toBe('12345');
    });

    it('wraps around 10 when the difference goes negative', () => {
      expect(Cypher.decrypt('0', '100000')).toBe('9');
      expect(Cypher.decrypt('04', '190000')).toBe('95');
    });

    it('cycles the PIN across digits longer than 6', () => {
      expect(Cypher.decrypt('2000002', '100000')).toBe('1000001');
    });

    it('returns undefined for non-digit value', () => {
      expect(Cypher.decrypt('abc', '100000')).toBeUndefined();
    });

    it('returns undefined for an invalid PIN', () => {
      expect(Cypher.decrypt('123', '12345')).toBeUndefined();
    });
  });

  describe('round-trip', () => {
    it('decrypt(encrypt(value)) returns the original value', () => {
      const cases = [
        ['0', '000000'],
        ['9999999999', '999999'],
        ['123456', '654321'],
        ['0000001', '123456'],
      ];

      cases.forEach(([value, pin]) => {
        expect(Cypher.decrypt(Cypher.encrypt(value, pin), pin)).toBe(value);
      });
    });
  });
});
