import { deriveSecretVisual, extractWebsiteDomain, resolveSecretIcon } from '../secretVisual';

describe('secretVisual matching', () => {
  it('does not match X/Twitter on arbitrary x characters', () => {
    expect(deriveSecretVisual({ name: 'expo' }).brand).toBeUndefined();
    expect(deriveSecretVisual({ name: 'fox' }).brand).toBeUndefined();
    expect(deriveSecretVisual({ name: 'currenxie.com' }).brand).toBeUndefined();
    expect(resolveSecretIcon({ name: 'expo', type: 'qrcode' })).toBe('qrcode');
  });

  it('matches X/Twitter only on real tokenized names', () => {
    expect(deriveSecretVisual({ name: 'X' }).brand).toBe('x');
    expect(deriveSecretVisual({ name: 'twitter.com' }).brand).toBe('x');
  });

  it('recognizes docker and dribbble', () => {
    expect(deriveSecretVisual({ name: 'Docker' })).toMatchObject({ brand: 'docker', icon: 'docker' });
    expect(deriveSecretVisual({ name: 'dribbble.com' })).toMatchObject({ brand: 'dribbble', icon: 'basketball' });
  });

  it('ignores stale persisted brands when the current name does not match them', () => {
    expect(resolveSecretIcon({ brand: 'x', name: 'expo', type: 'qrcode' })).toBe('qrcode');
    expect(resolveSecretIcon({ brand: 'x', name: 'docker', type: 'qrcode' })).toBe('docker');
  });

  it('uses the same icon matching policy for TOTP as other secrets', () => {
    expect(resolveSecretIcon({ brand: 'github', kind: 'totp', name: 'github', type: 'shield-key-outline' })).toBe('github');
    expect(resolveSecretIcon({ kind: 'totp', name: 'unknown service', type: 'shield-key-outline' })).toBe('shield-key-outline');
  });

  it('extracts website-like domains from website or name fields', () => {
    expect(extractWebsiteDomain('https://www.github.com/login')).toBe('github.com');
    expect(extractWebsiteDomain(undefined, 'Work account on stripe.com')).toBe('stripe.com');
    expect(extractWebsiteDomain(undefined, 'Booking')).toBe('booking.com');
    expect(extractWebsiteDomain(undefined, 'Attlasian workspace')).toBe('atlassian.com');
    expect(extractWebsiteDomain(undefined, 'coins')).toBe('coins.co.th');
    expect(extractWebsiteDomain(undefined, 'Currenxie')).toBe('currenxie.com');
    expect(extractWebsiteDomain(undefined, 'Dribbble profile')).toBe('dribbble.com');
    expect(extractWebsiteDomain(undefined, 'github')).toBe('');
  });
});
