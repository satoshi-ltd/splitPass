import { Cypher } from '../cypher';

describe('helpers/cypher', () => {
  test('alive', () => {
    expect(Cypher).toBeDefined();
    expect(Cypher.encrypt).toBeDefined();
    expect(Cypher.decrypt).toBeDefined();
  });

  describe('encrypt', () => {
    test('should encrypt the value with the provided pin', () => {
      expect(Cypher.encrypt('123456789', '123456')).toBe('246802802');
    });

    test('should return undefined when value is not a number', () => {
      expect(Cypher.encrypt(123456789, 123456)).toBeUndefined();
      expect(Cypher.encrypt('string', 123456)).toBeUndefined();
      expect(Cypher.encrypt([], 123456)).toBeUndefined();
      expect(Cypher.encrypt({}, 123456)).toBeUndefined();
      expect(Cypher.encrypt(true, 123456)).toBeUndefined();
    });

    test('should return undefined when pin is not a valid format', () => {
      expect(Cypher.encrypt(123456789, 123456)).toBeUndefined();
      expect(Cypher.encrypt(123456789, 'string')).toBeUndefined();
      expect(Cypher.encrypt(123456789, [])).toBeUndefined();
      expect(Cypher.encrypt(123456789, {})).toBeUndefined();
      expect(Cypher.encrypt(123456789, true)).toBeUndefined();
    });
  });

  describe('decrypt', () => {
    test('should decrypt the value with the provided pin', () => {
      expect(Cypher.decrypt('246802802', '123456')).toBe('123456789');
    });

    test('should return undefined when value is not a number', () => {
      expect(Cypher.decrypt(246802802, 123456)).toBeUndefined();
      expect(Cypher.decrypt('string', 123456)).toBeUndefined();
      expect(Cypher.decrypt([], 123456)).toBeUndefined();
      expect(Cypher.decrypt({}, 123456)).toBeUndefined();
      expect(Cypher.decrypt(true, 123456)).toBeUndefined();
    });

    test('should return undefined when pin is not a valid format', () => {
      expect(Cypher.decrypt(123456789, 123456)).toBeUndefined();
      expect(Cypher.decrypt(123456789, 'string')).toBeUndefined();
      expect(Cypher.decrypt(123456789, [])).toBeUndefined();
      expect(Cypher.decrypt(123456789, {})).toBeUndefined();
      expect(Cypher.decrypt(123456789, true)).toBeUndefined();
    });
  });
});
