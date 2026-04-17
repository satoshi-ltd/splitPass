(function attachSplitPassTotp(globalScope) {
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  function base32Decode(base32 = '') {
    const str = String(base32 || '').toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    const bytes = [];
    let buffer = 0;
    let bitsLeft = 0;

    for (let i = 0; i < str.length; i++) {
      const val = BASE32_ALPHABET.indexOf(str[i]);
      if (val === -1) continue;
      buffer = (buffer << 5) | val;
      bitsLeft += 5;
      if (bitsLeft >= 8) {
        bitsLeft -= 8;
        bytes.push((buffer >>> bitsLeft) & 0xff);
      }
    }

    return new Uint8Array(bytes);
  }

  function parseTotpParams(uri = '') {
    try {
      const match = String(uri || '').match(/^otpauth:\/\/totp\/([^?]+)(?:\?(.*))?$/i);
      if (!match) return null;

      const params = String(match[2] || '')
        .split('&')
        .filter(Boolean)
        .reduce((acc, pair) => {
          const [rawKey = '', ...rawValue] = pair.split('=');
          const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
          const value = decodeURIComponent(rawValue.join('=').replace(/\+/g, ' '));
          if (key) acc[key] = value;
          return acc;
        }, {});

      return {
        secret: String(params.secret || '').replace(/\s+/g, '').toUpperCase(),
        digits: Math.max(6, Math.min(8, parseInt(params.digits || '6', 10) || 6)),
        period: Math.max(1, parseInt(params.period || '30', 10) || 30),
      };
    } catch {
      return null;
    }
  }

  async function generateTOTP(uri = '') {
    const params = parseTotpParams(uri);
    if (!params?.secret) throw new Error('Invalid TOTP URI.');

    const keyBytes = base32Decode(params.secret);
    if (!keyBytes.length) throw new Error('Invalid TOTP secret.');

    const counter = Math.floor(Date.now() / 1000 / params.period);

    const counterBytes = new Uint8Array(8);
    let remaining = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = remaining & 0xff;
      remaining = Math.floor(remaining / 256);
    }

    const cryptoKey = await globalScope.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await globalScope.crypto.subtle.sign('HMAC', cryptoKey, counterBytes);
    const hash = new Uint8Array(signature);

    const offset = hash[hash.length - 1] & 0x0f;
    const otp =
      (((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)) %
      Math.pow(10, params.digits);

    return String(otp).padStart(params.digits, '0');
  }

  function isTotpUri(value = '') {
    return /^otpauth:\/\/totp\//i.test(String(value || ''));
  }

  function getTotpLabel(uri = '') {
    try {
      const match = String(uri || '').match(/^otpauth:\/\/totp\/([^?]+)/i);
      if (!match) return '';
      const label = decodeURIComponent(match[1].replace(/\+/g, ' '));
      const colonIdx = label.indexOf(':');
      return (colonIdx >= 0 ? label.slice(colonIdx + 1).trim() : label) || '';
    } catch {
      return '';
    }
  }

  // Syncs the CSS countdown animation on all .splitpass-item-type badges
  // within `root` to the actual TOTP clock (30 s period aligned to Unix time).
  function syncTotpBadges(root) {
    if (!root) return;
    const elapsed = (Date.now() / 1000) % 30;
    const delay = `-${elapsed.toFixed(3)}s`;
    root.querySelectorAll('.splitpass-item-type').forEach((badge) => {
      badge.style.animationDelay = delay;
    });
  }

  globalScope.SplitPassTotp = {
    generateTOTP,
    getTotpLabel,
    isTotpUri,
    syncTotpBadges,
  };
})(globalThis);
