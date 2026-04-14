import { UUID } from '../UUID';

describe('UUID', () => {
  it('returns the default UUID for an empty string', () => {
    expect(UUID('')).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('returns a string in UUID format (8-4-4-4-12 hex)', () => {
    const result = UUID('hello world');
    expect(result).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/);
  });

  it('is deterministic — same input always returns the same UUID', () => {
    expect(UUID('test')).toBe(UUID('test'));
    expect(UUID('splitpass')).toBe(UUID('splitpass'));
  });

  it('returns different UUIDs for different inputs', () => {
    expect(UUID('foo')).not.toBe(UUID('bar'));
  });

  it('accepts an object by JSON-stringifying it', () => {
    const result = UUID({ key: 'value' });
    expect(result).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/);
  });

  it('produces the same UUID for the same object shape', () => {
    expect(UUID({ key: 'value' })).toBe(UUID({ key: 'value' }));
  });

  it('the third group always starts with 4 (version 4 format)', () => {
    const [, , third] = UUID('anything').split('-');
    expect(third[0]).toBe('4');
  });

  it('works with numeric-looking strings', () => {
    const result = UUID('12345');
    expect(result).toMatch(/^[0-9A-F]{8}-/);
  });
});
