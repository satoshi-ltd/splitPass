import { parseTOTPURI } from './totp';

const SERVICE_ICON_CATALOG = [
  { brand: 'gmail', icon: 'email', keywords: ['gmail', 'google mail'] },
  { brand: 'google', icon: 'google', keywords: ['google', 'google workspace', 'google one', 'google drive'] },
  { brand: 'outlook', icon: 'email', keywords: ['outlook', 'hotmail', 'microsoft mail'] },
  { brand: 'proton', icon: 'email', keywords: ['proton', 'proton mail', 'protonmail'] },
  { brand: 'apple', icon: 'apple', keywords: ['apple', 'apple id', 'icloud'] },
  { brand: 'github', icon: 'github', keywords: ['github'] },

  { brand: 'x', icon: 'twitter', keywords: ['x', 'x com', 'twitter', 'twitter com', 'x pro'] },
  { brand: 'facebook', icon: 'facebook', keywords: ['facebook', 'facebook com', 'meta', 'meta ads'] },
  { brand: 'instagram', icon: 'instagram', keywords: ['instagram', 'instagram com'] },
  { brand: 'linkedin', icon: 'linkedin', keywords: ['linkedin', 'linkedin com'] },
  { brand: 'reddit', icon: 'reddit', keywords: ['reddit', 'reddit com'] },
  { brand: 'discord', icon: 'chat-processing-outline', keywords: ['discord', 'discord com'] },
  { brand: 'telegram', icon: 'send-outline', keywords: ['telegram', 'telegram org'] },
  { brand: 'whatsapp', icon: 'whatsapp', keywords: ['whatsapp', 'whatsapp com'] },
  { brand: 'slack', icon: 'slack', keywords: ['slack', 'slack com'] },
  { brand: 'youtube', icon: 'youtube', keywords: ['youtube', 'youtube premium', 'youtube com'] },
  { brand: 'docker', icon: 'docker', keywords: ['docker', 'docker hub', 'docker com'] },
  { brand: 'dribbble', icon: 'basketball', keywords: ['dribbble', 'dribbble com'] },

  { brand: 'netflix', icon: 'movie-open-outline', keywords: ['netflix', 'netflix family'] },
  { brand: 'spotify', icon: 'spotify', keywords: ['spotify', 'spotify family'] },
  { brand: 'twitch', icon: 'twitch', keywords: ['twitch', 'twitch tv'] },
  { brand: 'dropbox', icon: 'dropbox', keywords: ['dropbox', 'dropbox com'] },
  { brand: 'notion', icon: 'notebook-outline', keywords: ['notion', 'notion so'] },
  { brand: 'figma', icon: 'vector-square', keywords: ['figma', 'figma com'] },
  { brand: 'canva', icon: 'palette-outline', keywords: ['canva', 'canva com'] },
  { brand: 'zoom', icon: 'video-outline', keywords: ['zoom', 'zoom us'] },

  { brand: 'visa', icon: 'credit-card-outline', keywords: ['visa', 'visa personal', 'visa corp'] },
  { brand: 'mastercard', icon: 'credit-card-outline', keywords: ['mastercard', 'master card', 'master card corp'] },
  { brand: 'paypal', icon: 'wallet-outline', keywords: ['paypal', 'paypal personal', 'paypal business'] },
  { brand: 'stripe', icon: 'credit-card-outline', keywords: ['stripe', 'stripe dashboard'] },
  { brand: 'wise', icon: 'bank-outline', keywords: ['wise', 'wise personal'] },
  { brand: 'revolut', icon: 'bank-outline', keywords: ['revolut', 'revolut business'] },
  { brand: 'coinbase', icon: 'currency-usd', keywords: ['coinbase', 'coinbase vault'] },
  { brand: 'binance', icon: 'currency-btc', keywords: ['binance', 'binance account'] },

  { brand: 'ledger', icon: 'wallet-outline', keywords: ['ledger', 'ledger nano', 'ledger live'] },
  { brand: 'trezor', icon: 'wallet-outline', keywords: ['trezor', 'trezor suite'] },
  { brand: 'coldcard', icon: 'wallet-outline', keywords: ['coldcard'] },
  { brand: 'seedsigner', icon: 'wallet-outline', keywords: ['seedsigner', 'seed signer'] },
  { brand: 'wallet', icon: 'wallet-outline', keywords: ['wallet', 'seed'] },

  { brand: 'bitwarden', icon: 'shield-key-outline', keywords: ['bitwarden', 'bitwarden vault'] },
  { brand: 'claude', icon: 'robot-outline', keywords: ['claude', 'claude ai'] },
  { brand: 'openai', icon: 'robot-outline', keywords: ['openai', 'chatgpt'] },
  { brand: 'amazon', icon: 'shopping-outline', keywords: ['amazon', 'aws', 'aws console', 'aws root'] },
  { brand: 'booking', icon: 'bed-outline', keywords: ['booking', 'booking com'] },
  { brand: 'airbnb', icon: 'bed-outline', keywords: ['airbnb', 'airbnb com'] },
  { brand: 'bank', icon: 'bank-outline', keywords: ['bank'] },
  { brand: 'credit', icon: 'credit-card-outline', keywords: ['credit', 'credit card'] },
  { brand: 'debit', icon: 'credit-card-outline', keywords: ['debit', 'debit card'] },
  { brand: 'line', icon: 'chat-outline', keywords: ['line', 'line me'] },
  { brand: 'medium', icon: 'note-text-outline', keywords: ['medium', 'medium com'] },
  { brand: 'pinterest', icon: 'pinterest', keywords: ['pinterest', 'pinterest com'] },
  { brand: 'uber', icon: 'car-outline', keywords: ['uber', 'uber com'] },
];

const SERVICE_ICON_MAP = Object.fromEntries(SERVICE_ICON_CATALOG.map(({ brand, icon }) => [brand, icon]));

const normalize = (value = '') => `${value}`.trim().toLowerCase();

const normalizeWords = (...values) =>
  values
    .map(normalize)
    .join(' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const hasKeywordMatch = (haystack = '', keyword = '') => {
  const normalizedHaystack = ` ${normalizeWords(haystack)} `;
  const normalizedKeyword = normalizeWords(keyword);

  if (!normalizedKeyword) return false;

  return normalizedHaystack.includes(` ${normalizedKeyword} `);
};

const findServiceEntry = (haystack = '') =>
  SERVICE_ICON_CATALOG.find(({ keywords = [] }) => keywords.some((keyword) => hasKeywordMatch(haystack, keyword)));

const findServiceEntryByBrand = (brand = '') => SERVICE_ICON_CATALOG.find(({ brand: entryBrand }) => entryBrand === normalize(brand));

const detectCardBrand = (digits = '') => {
  if (!digits) return undefined;

  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(digits)) return 'visa';
  if (/^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(digits)) return 'mastercard';
  if (/^3[47]\d{13}$/.test(digits)) return 'amex';
  if (/^(6011\d{12}|65\d{14}|64[4-9]\d{13})$/.test(digits)) return 'discover';
  if (/^(30[0-5]\d{11}|36\d{12}|3[89]\d{12})$/.test(digits)) return 'diners';
  if (/^35(2[89]|[3-8]\d)\d{12}$/.test(digits)) return 'jcb';
  if (/^(50|5[6-9]|6\d)\d{10,17}$/.test(digits)) return 'maestro';

  return 'card';
};

const deriveSecretVisual = ({ name, secret } = {}) => {
  const totp = parseTOTPURI(secret);
  if (totp) {
    const haystack = normalizeWords(name, totp.issuer, totp.account);
    const matched = findServiceEntry(haystack);

    return {
      brand: matched?.brand,
      icon: matched?.icon || 'shield-key-outline',
      kind: 'totp',
    };
  }

  const digits = `${secret || ''}`.replace(/\D/g, '');
  if (digits.length >= 13 && digits.length <= 19 && digits.length === `${secret || ''}`.trim().length) {
    return {
      icon: 'credit-card-outline',
      kind: 'card',
      brand: detectCardBrand(digits),
    };
  }

  const haystack = normalizeWords(name);
  const matched = findServiceEntry(haystack);

  return {
    brand: matched?.brand,
    icon: matched?.icon,
    kind: matched?.brand === 'wallet' ? 'wallet' : matched ? 'service' : undefined,
  };
};

const resolveSecretIcon = ({ kind, brand, name, type } = {}) => {
  if (kind === 'card') return 'credit-card-outline';
  if (kind === 'totp') return 'shield-key-outline';

  const haystack = normalizeWords(name);
  const matched = findServiceEntry(haystack);
  const persisted = findServiceEntryByBrand(brand);

  if (persisted && (!haystack || matched?.brand === persisted.brand)) return persisted.icon;

  if (matched) return matched.icon;

  if (!haystack && brand && SERVICE_ICON_MAP[brand]) return SERVICE_ICON_MAP[brand];

  return type;
};

export { deriveSecretVisual, resolveSecretIcon };
