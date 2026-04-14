import { shamir } from '../shamir';

const SECRET = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'];

describe('shamir', () => {
  describe('split', () => {
    it('produces the requested number of shares', () => {
      expect(shamir.split(SECRET, 3, 2)).toHaveLength(3);
    });

    it('each share has the same length as the original secret', () => {
      shamir.split(SECRET, 3, 2).forEach((share) => expect(share).toHaveLength(SECRET.length));
    });

    it('with threshold=1 every share is a full copy of the secret', () => {
      shamir.split(SECRET, 3, 1).forEach((share) => expect(share).toEqual(SECRET));
    });

    it('with threshold=2 each share has undefined slots (words are hidden)', () => {
      shamir.split(SECRET, 2, 2).forEach((share) => expect(share).toContain(undefined));
    });

    it('no single share contains the complete secret when threshold > 1', () => {
      shamir.split(SECRET, 3, 2).forEach((share) => {
        const defined = share.filter((w) => w !== undefined);
        expect(defined.length).toBeLessThan(SECRET.length);
      });
    });

    it('works with 2-of-2 split', () => {
      const shares = shamir.split(SECRET, 2, 2);
      expect(shares).toHaveLength(2);
      shares.forEach((s) => expect(s).toHaveLength(SECRET.length));
    });
  });

  describe('combine', () => {
    it('recovers the secret combining all shares (2-of-2)', () => {
      const [s0, s1] = shamir.split(SECRET, 2, 2);
      expect(shamir.combine(s0, s1)).toEqual(SECRET);
    });

    it('recovers the secret from any pair among 3 shares (2-of-3)', () => {
      const [s0, s1, s2] = shamir.split(SECRET, 3, 2);
      expect(shamir.combine(s0, s1)).toEqual(SECRET);
      expect(shamir.combine(s0, s2)).toEqual(SECRET);
      expect(shamir.combine(s1, s2)).toEqual(SECRET);
    });

    it('a single share alone does not reconstruct the full secret', () => {
      const [s0] = shamir.split(SECRET, 2, 2);
      const combined = shamir.combine(s0);
      expect(combined).toContain(undefined);
      expect(combined).not.toEqual(SECRET);
    });

    it('round-trips correctly for a 24-word split', () => {
      const words = Array.from({ length: 24 }, (_, i) => `word${i}`);
      const [s0, s1, s2] = shamir.split(words, 3, 2);
      expect(shamir.combine(s0, s1)).toEqual(words);
      expect(shamir.combine(s1, s2)).toEqual(words);
      expect(shamir.combine(s0, s2)).toEqual(words);
    });

    it('each share is a strict subset of the secret (no new content)', () => {
      const [s0, s1] = shamir.split(SECRET, 2, 2);
      [s0, s1].forEach((share) => {
        share.forEach((word) => {
          if (word !== undefined) expect(SECRET).toContain(word);
        });
      });
    });
  });
});
