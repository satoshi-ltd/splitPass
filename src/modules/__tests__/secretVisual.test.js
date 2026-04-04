import { deriveSecretVisual, resolveSecretIcon } from '../secretVisual';

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
});
