(function attachSplitPassDecoder(globalScope) {
  const USERNAME_TYPE = 'B';

  const SECRET_TYPE = {
    PASSWORD: '1',
    PASSWORD_SECURE: '2',
    PASSWORD_SHARD: '3',
    SEED_PHRASE: '4',
    SEED_PHRASE_SECURE: '5',
    SEED_PHRASE_SHARD: '6',
    CARD: '7',
    CARD_SECURE: '8',
    CARD_SHARD: '9',
    TOTP: 'A',
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
    '~',
    "'",
    '"',
    '\\',
    '`',
  ];

  const PASSWORD_CONFIG = {
    regexp: /.{1,2}/g,
    set: chars,
  };

  const CARD_SECRET_PATTERN = /^(\d{13,19})\|((?:0[1-9]|1[0-2])\/\d{2})\|(\d{3,4})$/;

  function convertToDigits(value) {
    return String(value || '').split('').map(Number);
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

  function decodeWithConfig(digits, config) {
    const parts = String(digits || '').match(config.regexp || []) || [];
    if (!parts.length && digits) return undefined;

    const decoded = parts.map((index) => config.set[parseInt(index, 10) - 1]).join('');
    return decoded.includes('undefined') ? undefined : decoded;
  }

  function parseCardValue(value) {
    const text = String(value || '').trim();
    return CARD_SECRET_PATTERN.test(text) ? text : undefined;
  }

  function parseTOTPURI(value) {
    const text = String(value || '').trim();
    if (!/^otpauth:\/\/totp\//i.test(text)) return undefined;

    const match = text.match(/^otpauth:\/\/totp\/([^?]+)(?:\?(.*))?$/i);
    if (!match) return undefined;

    const query = String(match[2] || '');
    const params = query
      .split('&')
      .filter(Boolean)
      .reduce((output, pair) => {
        const [rawKey = '', ...rawValue] = pair.split('=');
        const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
        const nextValue = decodeURIComponent(rawValue.join('=').replace(/\+/g, ' '));
        if (key) output[key] = nextValue;
        return output;
      }, {});

    const secret = String(params.secret || '').replace(/\s+/g, '').toUpperCase();
    return /^[A-Z2-7]+=*$/.test(secret) ? text : undefined;
  }

  function isKnownType(type) {
    return Object.values(SECRET_TYPE).includes(type);
  }

  function isPasswordType(type) {
    return type === SECRET_TYPE.PASSWORD || type === SECRET_TYPE.PASSWORD_SECURE;
  }

  function isSecureType(type) {
    return type === SECRET_TYPE.PASSWORD_SECURE || type === SECRET_TYPE.CARD_SECURE || type === SECRET_TYPE.SEED_PHRASE_SECURE;
  }

  function decodeKnownQr(rawValue, passcode) {
    const qr = String(rawValue || '').trim();
    if (!qr) return { ok: false, code: 'empty' };

    const [type, ...rawDigits] = qr;

    if (type === USERNAME_TYPE) {
      const colonIdx = qr.indexOf(':');
      if (colonIdx < 2) return { ok: false, code: 'unsupported_type', type };
      let username;
      try {
        username = decodeURIComponent(qr.slice(1, colonIdx));
      } catch {
        return { ok: false, code: 'unsupported_type', type };
      }
      const innerResult = decodeKnownQr(qr.slice(colonIdx + 1), passcode);
      if (!innerResult.ok) return innerResult;
      return { ...innerResult, username };
    }

    if (!isKnownType(type)) return { ok: false, code: 'unsupported_type', type };

    if (type === SECRET_TYPE.PASSWORD_SHARD || type === SECRET_TYPE.SEED_PHRASE || type === SECRET_TYPE.SEED_PHRASE_SECURE || type === SECRET_TYPE.SEED_PHRASE_SHARD || type === SECRET_TYPE.CARD_SHARD) {
      return { ok: false, code: 'unsupported_type', type };
    }

    let digits = rawDigits.join('');

    if (isSecureType(type)) {
      if (!/^\d{6}$/.test(String(passcode || ''))) {
        return { ok: false, code: 'requires_passcode', type };
      }

      digits = decrypt(digits, String(passcode));
      if (digits?.length !== rawDigits.join('').length) {
        return { ok: false, code: 'invalid_passcode', type };
      }
    }

    const secret = decodeWithConfig(digits, PASSWORD_CONFIG);

    if (secret === undefined) {
      return { ok: false, code: isSecureType(type) ? 'invalid_passcode' : 'invalid_qr', type };
    }

    if (type === SECRET_TYPE.CARD || type === SECRET_TYPE.CARD_SECURE) {
      return parseCardValue(secret)
        ? { ok: false, code: 'unsupported_type', type, secret }
        : { ok: false, code: isSecureType(type) ? 'invalid_passcode' : 'invalid_qr', type };
    }

    if (type === SECRET_TYPE.TOTP) {
      const totpUri = parseTOTPURI(secret);
      return totpUri
        ? { ok: true, totpUri, type }
        : { ok: false, code: 'invalid_qr', type };
    }

    if (!isPasswordType(type)) {
      return { ok: false, code: 'unsupported_type', type, secret };
    }

    return {
      ok: true,
      secure: type === SECRET_TYPE.PASSWORD_SECURE,
      secret,
      type,
    };
  }

  globalScope.SplitPassDecoder = {
    SECRET_TYPE,
    USERNAME_TYPE,
    decode: decodeKnownQr,
  };
})(globalThis);
