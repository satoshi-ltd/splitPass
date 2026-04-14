import { findVault } from '../findVault';

describe('findVault', () => {
  describe('Account vault', () => {
    it('matches "email" keyword', () => expect(findVault({ name: 'My Email Account' })).toBe('Account'));
    it('matches "gmail" keyword', () => expect(findVault({ name: 'Gmail login' })).toBe('Account'));
    it('matches "icloud" keyword', () => expect(findVault({ name: 'iCloud credentials' })).toBe('Account'));
    it('matches "auth" keyword', () => expect(findVault({ name: 'Two-factor auth' })).toBe('Account'));
    it('matches "admin" keyword', () => expect(findVault({ name: 'admin portal' })).toBe('Account'));
  });

  describe('Finance vault', () => {
    it('matches "bank" keyword', () => expect(findVault({ name: 'Chase bank' })).toBe('Finance'));
    it('matches "card" keyword', () => expect(findVault({ name: 'Credit card pin' })).toBe('Finance'));
    it('matches "bitcoin" keyword', () => expect(findVault({ name: 'Bitcoin wallet' })).toBe('Finance'));
    it('matches "crypto" keyword', () => expect(findVault({ name: 'Crypto wallet seed' })).toBe('Finance'));
    it('matches "ledger" keyword', () => expect(findVault({ name: 'Ledger hardware wallet' })).toBe('Finance'));
    it('matches "paypal" keyword', () => expect(findVault({ name: 'PayPal payment' })).toBe('Finance'));
  });

  describe('Social vault', () => {
    it('matches "twitter" keyword', () => expect(findVault({ name: 'Twitter profile' })).toBe('Social'));
    it('matches "instagram" keyword', () => expect(findVault({ name: 'Instagram password' })).toBe('Social'));
    it('matches "discord" keyword', () => expect(findVault({ name: 'Discord server' })).toBe('Social'));
    it('matches "google" keyword', () => expect(findVault({ name: 'Google Drive' })).toBe('Social'));
    it('matches "youtube" keyword', () => expect(findVault({ name: 'YouTube channel' })).toBe('Social'));
  });

  describe('others vault (fallback)', () => {
    it('returns "others" for an unrecognized name', () => {
      expect(findVault({ name: 'My secret note' })).toBe('others');
    });

    it('returns "others" for an empty name', () => {
      expect(findVault({ name: '' })).toBe('others');
    });

    it('returns "others" for a name with no keyword match', () => {
      expect(findVault({ name: 'top secret vault' })).toBe('others');
    });
  });

  describe('case insensitivity', () => {
    it('matches keywords regardless of input case', () => {
      expect(findVault({ name: 'GMAIL LOGIN' })).toBe('Account');
      expect(findVault({ name: 'BITCOIN WALLET' })).toBe('Finance');
      expect(findVault({ name: 'TWITTER PROFILE' })).toBe('Social');
    });
  });
});
