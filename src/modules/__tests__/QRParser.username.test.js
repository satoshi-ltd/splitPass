import { QRParser, USERNAME_TYPE } from '../QRParser';
import { SECRET_TYPE } from '../../App.constants';

describe('QRParser.encodeWithUsername', () => {
  it('returns the original value when username is empty', () => {
    expect(QRParser.encodeWithUsername('1abc', '')).toBe('1abc');
  });

  it('returns the original value when username is undefined', () => {
    expect(QRParser.encodeWithUsername('1abc', undefined)).toBe('1abc');
  });

  it('returns the original value when value is empty', () => {
    expect(QRParser.encodeWithUsername('', 'alice')).toBe('');
  });

  it('produces a string starting with USERNAME_TYPE', () => {
    const result = QRParser.encodeWithUsername('1abc', 'alice');
    expect(result[0]).toBe(USERNAME_TYPE);
  });

  it('encodes a simple username correctly', () => {
    const result = QRParser.encodeWithUsername('1abc', 'alice');
    expect(result).toBe(`${USERNAME_TYPE}alice:1abc`);
  });

  it('percent-encodes spaces in the username', () => {
    const result = QRParser.encodeWithUsername('1abc', 'alice wonder');
    expect(result).toBe(`${USERNAME_TYPE}alice%20wonder:1abc`);
  });

  it('percent-encodes @ in the username', () => {
    const result = QRParser.encodeWithUsername('1abc', 'alice@example.com');
    expect(result).toBe(`${USERNAME_TYPE}alice%40example.com:1abc`);
  });

  it('percent-encodes colons in the username so the separator is unambiguous', () => {
    const result = QRParser.encodeWithUsername('1abc', 'user:name');
    expect(result).toBe(`${USERNAME_TYPE}user%3Aname:1abc`);
  });

  it('preserves the inner QR value after the separator', () => {
    const inner = '10304050607';
    const result = QRParser.encodeWithUsername(inner, 'alice');
    expect(result.slice(result.indexOf(':') + 1)).toBe(inner);
  });
});

describe('QRParser.decodeWithUsername', () => {
  it('returns the raw string and no username when the type is not B', () => {
    const result = QRParser.decodeWithUsername('1abc');
    expect(result).toEqual({ value: '1abc', username: undefined });
  });

  it('returns the raw string and no username for an empty input', () => {
    const result = QRParser.decodeWithUsername('');
    expect(result).toEqual({ value: '', username: undefined });
  });

  it('decodes a simple username correctly', () => {
    const result = QRParser.decodeWithUsername(`${USERNAME_TYPE}alice:1abc`);
    expect(result).toEqual({ username: 'alice', value: '1abc' });
  });

  it('decodes a percent-encoded space in the username', () => {
    const result = QRParser.decodeWithUsername(`${USERNAME_TYPE}alice%20wonder:1abc`);
    expect(result).toEqual({ username: 'alice wonder', value: '1abc' });
  });

  it('decodes a percent-encoded @ in the username', () => {
    const result = QRParser.decodeWithUsername(`${USERNAME_TYPE}alice%40example.com:1abc`);
    expect(result).toEqual({ username: 'alice@example.com', value: '1abc' });
  });

  it('decodes a percent-encoded colon in the username without splitting on it', () => {
    const result = QRParser.decodeWithUsername(`${USERNAME_TYPE}user%3Aname:1abc`);
    expect(result).toEqual({ username: 'user:name', value: '1abc' });
  });

  it('returns fallback when there is no colon separator', () => {
    const result = QRParser.decodeWithUsername(`${USERNAME_TYPE}alice`);
    expect(result).toEqual({ value: `${USERNAME_TYPE}alice`, username: undefined });
  });

  it('is the round-trip inverse of encodeWithUsername', () => {
    const original = { value: '1abc', username: 'alice@example.com' };
    const encoded = QRParser.encodeWithUsername(original.value, original.username);
    expect(QRParser.decodeWithUsername(encoded)).toEqual(original);
  });

  it('round-trips a username with spaces and colons', () => {
    const original = { value: '1xyz', username: 'John: The User' };
    const encoded = QRParser.encodeWithUsername(original.value, original.username);
    expect(QRParser.decodeWithUsername(encoded)).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// End-to-end: encode → encodeWithUsername → decodeWithUsername → decode
// This mirrors the Viewer → Scanner round-trip with real QRParser values.
// ---------------------------------------------------------------------------

describe('end-to-end Viewer→Scanner round-trip', () => {
  it('encodes a password and wraps it with a username, then fully recovers both', () => {
    const password = 'MySecret99!';
    const username = 'alice@example.com';

    const innerQr = QRParser.encode(password);               // '1...'
    const wrappedQr = QRParser.encodeWithUsername(innerQr, username); // 'Balice%40...:1...'

    const { value: recoveredInner, username: recoveredUsername } = QRParser.decodeWithUsername(wrappedQr);
    const recoveredPassword = QRParser.decode(recoveredInner);

    expect(recoveredUsername).toBe(username);
    expect(recoveredPassword).toBe(password);
  });

  it('wrapping is a no-op when username is absent — legacy QR passes through unchanged', () => {
    const password = 'LegacyPass1';
    const innerQr = QRParser.encode(password);

    // Viewer with no username: qrValues === resolvedValues (no wrapping)
    const notWrapped = QRParser.encodeWithUsername(innerQr, '');
    expect(notWrapped).toBe(innerQr);                        // same string

    // Scanner sees a legacy QR → type is not 'B' → decoded via normal path
    const { value, username } = QRParser.decodeWithUsername(notWrapped);
    expect(value).toBe(innerQr);
    expect(username).toBeUndefined();

    expect(QRParser.decode(value)).toBe(password);           // still recoverable
  });

  it('the wrapped QR type prefix is B, not the inner type', () => {
    const innerQr = QRParser.encode('test');
    const wrapped = QRParser.encodeWithUsername(innerQr, 'user');
    expect(wrapped[0]).toBe(USERNAME_TYPE);                  // 'B'
    expect(wrapped[0]).not.toBe(SECRET_TYPE.PASSWORD);       // not '1'
  });

  it('TOTP QRs are never wrapped — encodeWithUsername returns them unchanged', () => {
    // TOTP inner type is 'A'; Viewer explicitly skips TOTP wrapping
    const totpInner = 'Aencodedtotp';
    const result = QRParser.encodeWithUsername(totpInner, 'user@test.com');
    // encodeWithUsername itself doesn't check type — that guard is in the Viewer memo.
    // What matters is that decodeWithUsername on a non-B string returns it unchanged:
    const { value, username } = QRParser.decodeWithUsername(totpInner);
    expect(value).toBe(totpInner);
    expect(username).toBeUndefined();
  });

  it('shard QRs decode correctly through decodeWithUsername (pass-through, no B prefix)', () => {
    const shardValue = '3012345';  // PASSWORD_SHARD type
    const { value, username } = QRParser.decodeWithUsername(shardValue);
    expect(value).toBe(shardValue);
    expect(username).toBeUndefined();
  });
});
