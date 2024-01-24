import { isSeedPhrase } from '../isSeedPhrase';
import { bip39 } from '../repositories';

const seedPhrase12 = [...bip39].sort(() => Math.random() - 0.5).slice(0, 12);
const seedPhrase24 = [...bip39].sort(() => Math.random() - 0.5).slice(0, 24);
const fruits = [
  'Manzana',
  'Plátano',
  'Naranja',
  'Uva',
  'Fresa',
  'Pera',
  'Kiwi',
  'Piña',
  'Mango',
  'Sandía',
  'Cereza',
  'Melón',
];

describe('helpers/isSeedPhrase', () => {
  test('alive', () => {
    expect(isSeedPhrase).toBeDefined();
  });

  test('should return true for a valid seed phrase', () => {
    expect(isSeedPhrase(seedPhrase12)).toBe(true);
    expect(isSeedPhrase(seedPhrase12.join(' '))).toBe(true);
    expect(isSeedPhrase([...seedPhrase12.slice(0, 11), undefined])).toBe(true);
    expect(isSeedPhrase(seedPhrase24)).toBe(true);
    expect(isSeedPhrase(seedPhrase24.join(' '))).toBe(true);
    expect(isSeedPhrase([...seedPhrase24.slice(0, 11), undefined])).toBe(true);
  });

  test('should return false for an invalid seed phrase', () => {
    expect(isSeedPhrase(fruits)).toBe(false);
    expect(isSeedPhrase(fruits.join(' '))).toBe(false);
    expect(isSeedPhrase([...fruits.slice(0, 11), undefined])).toBe(false);
  });
});
