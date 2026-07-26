/* global Uint8Array */
import { shamir } from '../shamir';

const SECRET = Uint8Array.from('4000101300010203000102030001', (char) => char.charCodeAt(0));
const fixedRandom = (length) => Uint8Array.from({ length }, (_, index) => ((index * 37 + 13) % 255) + 1);
const bytes = (value) => Uint8Array.from(`${value}`, (char) => char.charCodeAt(0));
const toStr = (buffer) => String.fromCharCode(...buffer);

describe('shamir (GF256)', () => {
  describe('split', () => {
    it('produces the requested number of shares', () => {
      expect(shamir.split(SECRET, 3, 2, fixedRandom)).toHaveLength(3);
    });

    it('each share carries a distinct x and a y of the secret length', () => {
      const shares = shamir.split(SECRET, 3, 2, fixedRandom);
      expect(shares.map((s) => s.x)).toEqual([1, 2, 3]);
      shares.forEach((share) => expect(share.y).toHaveLength(SECRET.length));
    });

    it('no single share reveals the secret bytes (threshold 2)', () => {
      shamir.split(SECRET, 3, 2, fixedRandom).forEach((share) => {
        expect(toStr(share.y)).not.toEqual(toStr(SECRET));
      });
    });
  });

  describe('combine', () => {
    it('recovers the secret from any pair of a 2-of-3 split', () => {
      const [s0, s1, s2] = shamir.split(SECRET, 3, 2, fixedRandom);
      expect(toStr(shamir.combine([s0, s1]))).toEqual(toStr(SECRET));
      expect(toStr(shamir.combine([s0, s2]))).toEqual(toStr(SECRET));
      expect(toStr(shamir.combine([s1, s2]))).toEqual(toStr(SECRET));
    });

    it('recovers the secret from a 2-of-2 split', () => {
      const [s0, s1] = shamir.split(bytes('secret-payload-123'), 2, 2, fixedRandom);
      expect(toStr(shamir.combine([s0, s1]))).toEqual('secret-payload-123');
    });

    it('a single share alone does not reconstruct the secret', () => {
      const [s0] = shamir.split(SECRET, 3, 2, fixedRandom);
      expect(toStr(shamir.combine([s0]))).not.toEqual(toStr(SECRET));
    });

    it('round-trips arbitrary byte values including 0 and 255', () => {
      const secret = Uint8Array.from([0, 1, 127, 128, 254, 255, 0, 42]);
      const [s0, s1, s2] = shamir.split(secret, 3, 2, fixedRandom);
      expect(Array.from(shamir.combine([s2, s0]))).toEqual(Array.from(secret));
      expect(Array.from(shamir.combine([s1, s2]))).toEqual(Array.from(secret));
    });

    it('works with a 3-of-5 split requiring any three shares', () => {
      const secret = bytes('threshold-three-of-five');
      const shares = shamir.split(secret, 5, 3, fixedRandom);
      expect(shares).toHaveLength(5);
      expect(toStr(shamir.combine([shares[0], shares[2], shares[4]]))).toEqual('threshold-three-of-five');
      expect(toStr(shamir.combine([shares[1], shares[3], shares[4]]))).toEqual('threshold-three-of-five');
    });

    it('uses real randomness by default (secret still recovers)', () => {
      const secret = bytes('default-random-source');
      const [s0, s1] = shamir.split(secret, 2, 2);
      expect(toStr(shamir.combine([s0, s1]))).toEqual('default-random-source');
    });
  });
});
