(function attachSplitPassPassphrase(globalScope) {
  const countCharacterCategories = (value = '') =>
    [/[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9\s]/.test(value)].filter(Boolean).length;

  // Mirrors getPassphraseStrength in src/modules/passwordGenerator.js — keep in sync.
  const getPassphraseStrength = (value = '') => {
    const normalized = `${value}`;
    const length = normalized.length;

    if (length < 8) return 'weak';

    const words = normalized.trim().split(/\s+/).filter(Boolean).length;
    const categories = countCharacterCategories(normalized);

    if (words >= 4 || length >= 20) return 'strong';
    if ((words >= 3 && length >= 12) || (length >= 16 && categories >= 2)) return 'strong';
    if (length >= 12 || (length >= 10 && categories >= 3)) return 'medium';

    return 'weak';
  };

  globalScope.SplitPassPassphrase = { getPassphraseStrength };
})(globalThis);
