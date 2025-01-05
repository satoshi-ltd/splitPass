const convertToDigits = (value = '') => value.split('').map(Number);

const invalidInputs = (value, pin) =>
  typeof value !== 'string' || !/^\d+$/.test(value) || typeof pin !== 'string' || !/^\d{6}$/.test(pin);

export const Cypher = {
  encrypt: (value = '', pin = '') => {
    if (invalidInputs(value, pin)) return;
    const pinDigits = convertToDigits(pin);

    try {
      return convertToDigits(value)
        .map((digit, index) => (digit + pinDigits[index % 6]) % 10)
        .join('');
    } catch {
      return;
    }
  },

  decrypt: (value = '', pin = '') => {
    if (invalidInputs(value, pin)) return;
    const pinDigits = convertToDigits(pin);

    try {
      return convertToDigits(value)
        .map((digit, index) => (digit - pinDigits[index % 6] + 10) % 10)
        .join('');
    } catch {
      return;
    }
  },
};
