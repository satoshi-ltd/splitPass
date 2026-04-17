/**
 * Tests for browser-extension/lib/splitpass.js
 *
 * The file is a plain IIFE that attaches SplitPassDecoder to globalThis.
 * Requiring it executes the IIFE in Jest's jsdom environment.
 *
 * QR fixture values are pre-computed from the same encoding algorithm used
 * by both QRParser.js (app) and splitpass.js (extension):
 *   char → (chars.indexOf(char) + 1).toString().padStart(2, '0')
 *
 * Fixtures used throughout:
 *   'hello'    → encoded '0805121215'   → QR '10805121215'
 *   'abc'      → encoded '010203'       → QR '1010203'
 *   'Pass123!' → encoded '4201191954555663' → QR '14201191954555663'
 */

require('../lib/splitpass.js');

const { decode, USERNAME_TYPE, SECRET_TYPE } = globalThis.SplitPassDecoder;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PASSWORD_QR = '10805121215';       // decodes to 'hello'
const PASSWORD_QR_ABC = '1010203';       // decodes to 'abc'
const USERNAME_QR = `B${encodeURIComponent('alice')}:${PASSWORD_QR}`;
const USERNAME_QR_EMAIL = `B${encodeURIComponent('alice@test.com')}:${PASSWORD_QR}`;
const USERNAME_QR_COLON = `B${encodeURIComponent('user:name')}:${PASSWORD_QR}`;
const USERNAME_QR_SPACES = `B${encodeURIComponent('Alice Wonder')}:${PASSWORD_QR}`;

// ---------------------------------------------------------------------------
// Legacy (no-username) QR codes
// ---------------------------------------------------------------------------

describe('legacy PASSWORD QR (no username)', () => {
  it('decodes successfully', () => {
    const result = decode(PASSWORD_QR);
    expect(result.ok).toBe(true);
    expect(result.secret).toBe('hello');
  });

  it('does not include a username field', () => {
    const result = decode(PASSWORD_QR);
    expect(result.username).toBeUndefined();
  });

  it('identifies the type correctly', () => {
    const result = decode(PASSWORD_QR);
    expect(result.type).toBe(SECRET_TYPE.PASSWORD);
  });

  it('decodes another password correctly', () => {
    const result = decode(PASSWORD_QR_ABC);
    expect(result.ok).toBe(true);
    expect(result.secret).toBe('abc');
  });

  it('returns empty error for an empty string', () => {
    expect(decode('')).toMatchObject({ ok: false, code: 'empty' });
  });

  it('returns unsupported_type for an unknown type prefix', () => {
    expect(decode('https://example.com')).toMatchObject({ ok: false, code: 'unsupported_type' });
  });

  it('returns unsupported_type for shard QRs (not fillable)', () => {
    expect(decode('3010203')).toMatchObject({ ok: false, code: 'unsupported_type' });
  });

  it('returns unsupported_type for seed phrase QRs', () => {
    expect(decode('4010203')).toMatchObject({ ok: false, code: 'unsupported_type' });
  });

  it('returns requires_passcode for a secure QR without passcode', () => {
    expect(decode('20805121215')).toMatchObject({ ok: false, code: 'requires_passcode' });
  });
});

// ---------------------------------------------------------------------------
// QR codes with username (B-type envelope)
// ---------------------------------------------------------------------------

describe('username QR (B-type envelope)', () => {
  it('USERNAME_TYPE is B', () => {
    expect(USERNAME_TYPE).toBe('B');
  });

  it('decodes a simple username correctly', () => {
    const result = decode(USERNAME_QR);
    expect(result.ok).toBe(true);
    expect(result.secret).toBe('hello');
    expect(result.username).toBe('alice');
  });

  it('decodes an email address username (percent-encoded @)', () => {
    const result = decode(USERNAME_QR_EMAIL);
    expect(result.ok).toBe(true);
    expect(result.username).toBe('alice@test.com');
    expect(result.secret).toBe('hello');
  });

  it('decodes a username containing a colon (percent-encoded :)', () => {
    const result = decode(USERNAME_QR_COLON);
    expect(result.ok).toBe(true);
    expect(result.username).toBe('user:name');
    expect(result.secret).toBe('hello');
  });

  it('decodes a username with spaces (percent-encoded spaces)', () => {
    const result = decode(USERNAME_QR_SPACES);
    expect(result.ok).toBe(true);
    expect(result.username).toBe('Alice Wonder');
    expect(result.secret).toBe('hello');
  });

  it('passes the type through from the inner QR', () => {
    const result = decode(USERNAME_QR);
    expect(result.type).toBe(SECRET_TYPE.PASSWORD);
  });

  it('marks as unsupported when inner type is unknown', () => {
    const result = decode('Balice:Xinvalid');
    expect(result.ok).toBe(false);
    expect(result.code).toBe('unsupported_type');
  });

  it('marks as unsupported when there is no colon separator', () => {
    const result = decode('Balicewithnoseparator');
    expect(result.ok).toBe(false);
    expect(result.code).toBe('unsupported_type');
  });

  it('marks as unsupported when the separator is at position 1 (no username)', () => {
    const result = decode('B:1010203');
    expect(result.ok).toBe(false);
    expect(result.code).toBe('unsupported_type');
  });

  it('returns requires_passcode when the inner QR is secure and no passcode is given', () => {
    const secureInner = `2${PASSWORD_QR.slice(1)}`; // type '2' = PASSWORD_SECURE
    const result = decode(`Balice:${secureInner}`);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('requires_passcode');
  });

  it('inner value is never exposed — only the decoded secret is returned', () => {
    const result = decode(USERNAME_QR);
    expect(result.ok).toBe(true);
    // The raw B-type string must not appear in any result field
    expect(JSON.stringify(result)).not.toContain('Balice');
  });
});

// ---------------------------------------------------------------------------
// Round-trip: encode → B-wrap → decode (mirrors Viewer → Scanner flow)
// ---------------------------------------------------------------------------

describe('round-trip: Viewer QR → Extension decoder', () => {
  it('a B-type QR built from a known PASSWORD QR decodes to the same secret', () => {
    const bQr = `B${encodeURIComponent('viewer@test.com')}:${PASSWORD_QR}`;
    const result = decode(bQr);
    expect(result.ok).toBe(true);
    expect(result.secret).toBe('hello');
    expect(result.username).toBe('viewer@test.com');
  });

  it('a legacy QR passed through the decoder is identical to passing it directly', () => {
    const direct = decode(PASSWORD_QR);
    // Simulate the Viewer not wrapping (no username) → same raw QR reaches extension
    const viaLegacy = decode(PASSWORD_QR);
    expect(direct).toEqual(viaLegacy);
  });

  it('decoding without username and with username produce different result shapes', () => {
    const legacy = decode(PASSWORD_QR);
    const withUsername = decode(USERNAME_QR);
    expect(legacy.username).toBeUndefined();
    expect(withUsername.username).toBe('alice');
    expect(legacy.secret).toBe(withUsername.secret); // same underlying secret
  });
});
