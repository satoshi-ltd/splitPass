/* global Uint8Array */
import { getRandomBytes } from 'expo-crypto';

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

const xtime = (a) => ((a << 1) ^ (a & 0x80 ? 0x11b : 0)) & 0xff;

(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x = (xtime(x) ^ x) & 0xff;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
})();

const gmul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);
const gdiv = (a, b) => (a === 0 ? 0 : EXP[(LOG[a] - LOG[b] + 255) % 255]);

const evaluate = (coeffs, x) => {
  let acc = 0;
  for (let index = coeffs.length - 1; index >= 0; index -= 1) acc = gmul(acc, x) ^ coeffs[index];

  return acc;
};

export const shamir = {
  split: (secret = new Uint8Array(), shares = 3, threshold = 2, randomBytes = getRandomBytes) => {
    const points = Array.from({ length: shares }, (_, index) => ({ x: index + 1, y: new Uint8Array(secret.length) }));

    for (let byte = 0; byte < secret.length; byte += 1) {
      const coeffs = new Uint8Array(threshold);
      coeffs[0] = secret[byte];
      const random = threshold > 1 ? randomBytes(threshold - 1) : new Uint8Array();
      for (let degree = 1; degree < threshold; degree += 1) coeffs[degree] = random[degree - 1];

      points.forEach((point) => {
        point.y[byte] = evaluate(coeffs, point.x);
      });
    }

    return points;
  },

  combine: (points = []) => {
    const length = points[0]?.y?.length || 0;
    const secret = new Uint8Array(length);

    for (let byte = 0; byte < length; byte += 1) {
      let acc = 0;

      for (let i = 0; i < points.length; i += 1) {
        let numerator = 1;
        let denominator = 1;

        for (let j = 0; j < points.length; j += 1) {
          if (i === j) continue;
          numerator = gmul(numerator, points[j].x);
          denominator = gmul(denominator, points[i].x ^ points[j].x);
        }

        acc ^= gmul(points[i].y[byte], gdiv(numerator, denominator));
      }

      secret[byte] = acc;
    }

    return secret;
  },
};
