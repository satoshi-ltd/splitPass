(function attachSplitPassDecoder(globalScope) {
  const SECRET_TYPE = {
    PASSWORD: '1',
    PASSWORD_SECURE: '2',
  };

  const chars = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '-',
    '_',
    '=',
    '+',
    '[',
    ']',
    '{',
    '}',
    '|',
    ';',
    ':',
    ',',
    '.',
    '<',
    '>',
    '?',
    '/',
    ' ',
  ];

  const pairPattern = /.{1,2}/g;

  function convertToDigits(value) {
    return String(value).split('').map(Number);
  }

  function invalidInputs(value, pin) {
    return typeof value !== 'string' || !/^\d+$/.test(value) || typeof pin !== 'string' || !/^\d{6}$/.test(pin);
  }

  function decrypt(value, pin) {
    if (invalidInputs(value, pin)) return undefined;

    const pinDigits = convertToDigits(pin);

    try {
      return convertToDigits(value)
        .map((digit, index) => (digit - pinDigits[index % 6] + 10) % 10)
        .join('');
    } catch {
      return undefined;
    }
  }

  function decodeDigits(digits) {
    const pairs = String(digits).match(pairPattern) || [];
    let decoded = '';

    for (const pair of pairs) {
      const charIndex = Number(pair) - 1;

      if (!Number.isInteger(charIndex) || charIndex < 0 || charIndex >= chars.length) {
        return undefined;
      }

      decoded += chars[charIndex];
    }

    return decoded;
  }

  function decode(rawValue, passcode) {
    const qr = String(rawValue || '').trim();

    if (!qr) {
      return { ok: false, code: 'empty' };
    }

    const type = qr.charAt(0);
    const digits = qr.slice(1);

    if (type !== SECRET_TYPE.PASSWORD && type !== SECRET_TYPE.PASSWORD_SECURE) {
      return { ok: false, code: 'unsupported_type', type };
    }

    if (!/^\d+$/.test(digits) || digits.length < 2 || digits.length % 2 !== 0) {
      return { ok: false, code: 'invalid_qr', type };
    }

    if (type === SECRET_TYPE.PASSWORD_SECURE) {
      if (!/^\d{6}$/.test(String(passcode || ''))) {
        return { ok: false, code: 'requires_passcode', type };
      }

      const decrypted = decrypt(digits, String(passcode));
      const secret = decrypted ? decodeDigits(decrypted) : undefined;

      if (!secret && secret !== '') {
        return { ok: false, code: 'invalid_passcode', type };
      }

      return { ok: true, secret, secure: true, type };
    }

    const secret = decodeDigits(digits);

    if (!secret && secret !== '') {
      return { ok: false, code: 'invalid_qr', type };
    }

    return { ok: true, secret, secure: false, type };
  }

  globalScope.SplitPassDecoder = {
    SECRET_TYPE,
    decode,
  };
})(globalThis);
