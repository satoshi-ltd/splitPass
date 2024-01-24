import { bip39 } from './bip39';

export const pinToMnemonic = (pin) => {
  if (!/^\d{6}$/.test(pin.toString())) return;

  const hash = ((pin * 997) % 10000) * 991; // Operaciones matemáticas para obtener un valor variado

  const word1Index = hash % bip39.length;
  const word2Index = (hash * 2) % bip39.length;

  return `${bip39[word1Index]} ${bip39[word2Index]}`;
};
