import { parseTOTPURI } from './totp';

const SERVICE_ICON_CATALOG = [
  { brand: 'gmail', icon: 'email', keywords: ['gmail', 'google mail'] },
  { brand: 'google', icon: 'google', keywords: ['google', 'google workspace', 'google one', 'google drive'] },
  { brand: 'microsoft', icon: 'briefcase-outline', keywords: ['microsoft', 'office', 'office 365', 'm365'] },
  { brand: 'yahoo', icon: 'email', keywords: ['yahoo', 'yahoo mail'] },
  { brand: 'outlook', icon: 'email', keywords: ['outlook', 'hotmail', 'microsoft mail'] },
  { brand: 'proton', icon: 'email', keywords: ['proton', 'proton mail', 'protonmail'] },
  { brand: 'icloud', icon: 'cloud-outline', keywords: ['icloud', 'i cloud'] },
  { brand: 'apple', icon: 'apple', keywords: ['apple', 'apple id', 'icloud'] },
  { brand: 'github', icon: 'github', keywords: ['github'] },
  { brand: 'gitlab', icon: 'gitlab', keywords: ['gitlab'] },
  { brand: 'bitbucket', icon: 'source-branch', keywords: ['bitbucket'] },

  { brand: 'x', icon: 'twitter', keywords: ['x', 'x com', 'twitter', 'twitter com', 'x pro'] },
  { brand: 'facebook', icon: 'facebook', keywords: ['facebook', 'facebook com', 'meta', 'meta ads'] },
  { brand: 'instagram', icon: 'instagram', keywords: ['instagram', 'instagram com'] },
  { brand: 'threads', icon: 'message-outline', keywords: ['threads', 'threads net'] },
  { brand: 'tiktok', icon: 'music-note-outline', keywords: ['tiktok', 'tik tok'] },
  { brand: 'snapchat', icon: 'chat-outline', keywords: ['snapchat', 'snap chat'] },
  { brand: 'linkedin', icon: 'linkedin', keywords: ['linkedin', 'linkedin com'] },
  { brand: 'reddit', icon: 'reddit', keywords: ['reddit', 'reddit com'] },
  { brand: 'discord', icon: 'chat-processing-outline', keywords: ['discord', 'discord com'] },
  { brand: 'telegram', icon: 'send-outline', keywords: ['telegram', 'telegram org'] },
  { brand: 'wechat', icon: 'chat-outline', keywords: ['wechat', 'we chat'] },
  { brand: 'whatsapp', icon: 'whatsapp', keywords: ['whatsapp', 'whatsapp com'] },
  { brand: 'slack', icon: 'slack', keywords: ['slack', 'slack com'] },
  { brand: 'skype', icon: 'chat-outline', keywords: ['skype'] },
  { brand: 'youtube', icon: 'youtube', keywords: ['youtube', 'youtube premium', 'youtube com'] },
  { brand: 'vimeo', icon: 'video-outline', keywords: ['vimeo', 'vimeo com'] },
  { brand: 'docker', icon: 'docker', keywords: ['docker', 'docker hub', 'docker com'] },
  { brand: 'dribbble', icon: 'basketball', keywords: ['dribbble', 'dribbble com'] },

  { brand: 'netflix', icon: 'movie-open-outline', keywords: ['netflix', 'netflix family'] },
  { brand: 'spotify', icon: 'spotify', keywords: ['spotify', 'spotify family'] },
  { brand: 'disney', icon: 'movie-open-outline', keywords: ['disney', 'disney plus', 'disney+'] },
  { brand: 'primevideo', icon: 'movie-open-outline', keywords: ['prime video', 'amazon prime video'] },
  { brand: 'hbo', icon: 'movie-open-outline', keywords: ['hbo', 'hbo max', 'max'] },
  { brand: 'twitch', icon: 'twitch', keywords: ['twitch', 'twitch tv'] },
  { brand: 'steam', icon: 'controller-classic-outline', keywords: ['steam', 'steam account'] },
  { brand: 'epicgames', icon: 'controller-classic-outline', keywords: ['epic games', 'epicgames'] },
  { brand: 'playstation', icon: 'controller-classic-outline', keywords: ['playstation', 'psn'] },
  { brand: 'xbox', icon: 'controller-classic-outline', keywords: ['xbox', 'xbox live'] },
  { brand: 'ea', icon: 'controller-classic-outline', keywords: ['ea', 'electronic arts', 'ea app'] },
  { brand: 'ubisoft', icon: 'controller-classic-outline', keywords: ['ubisoft', 'uplay'] },
  { brand: 'dropbox', icon: 'dropbox', keywords: ['dropbox', 'dropbox com'] },
  { brand: 'notion', icon: 'notebook-outline', keywords: ['notion', 'notion so'] },
  { brand: 'adobe', icon: 'file-document-outline', keywords: ['adobe', 'creative cloud'] },
  { brand: 'figma', icon: 'vector-square', keywords: ['figma', 'figma com'] },
  { brand: 'canva', icon: 'palette-outline', keywords: ['canva', 'canva com'] },
  { brand: 'miro', icon: 'vector-arrange-above', keywords: ['miro', 'miro com'] },
  { brand: 'shopify', icon: 'shopping-outline', keywords: ['shopify', 'shopify com'] },
  { brand: 'ebay', icon: 'shopping-outline', keywords: ['ebay', 'ebay com'] },
  { brand: 'aliexpress', icon: 'shopping-outline', keywords: ['aliexpress', 'ali express'] },
  { brand: 'mercadolibre', icon: 'shopping-outline', keywords: ['mercadolibre', 'mercado libre'] },
  { brand: 'zoom', icon: 'video-outline', keywords: ['zoom', 'zoom us'] },

  { brand: 'visa', icon: 'credit-card-outline', keywords: ['visa', 'visa personal', 'visa corp'] },
  { brand: 'mastercard', icon: 'credit-card-outline', keywords: ['mastercard', 'master card', 'master card corp'] },
  { brand: 'amex', icon: 'credit-card-outline', keywords: ['amex', 'american express'] },
  { brand: 'paypal', icon: 'wallet-outline', keywords: ['paypal', 'paypal personal', 'paypal business'] },
  { brand: 'payoneer', icon: 'wallet-outline', keywords: ['payoneer'] },
  { brand: 'remitly', icon: 'wallet-outline', keywords: ['remitly'] },
  { brand: 'westernunion', icon: 'wallet-outline', keywords: ['western union', 'westernunion'] },
  { brand: 'stripe', icon: 'credit-card-outline', keywords: ['stripe', 'stripe dashboard'] },
  { brand: 'wise', icon: 'bank-outline', keywords: ['wise', 'wise personal'] },
  { brand: 'revolut', icon: 'bank-outline', keywords: ['revolut', 'revolut business'] },
  { brand: 'n26', icon: 'bank-outline', keywords: ['n26', 'n26 bank'] },
  { brand: 'monzo', icon: 'bank-outline', keywords: ['monzo', 'monzo bank'] },
  { brand: 'bunq', icon: 'bank-outline', keywords: ['bunq'] },
  { brand: 'chime', icon: 'bank-outline', keywords: ['chime', 'chime bank'] },
  { brand: 'starling', icon: 'bank-outline', keywords: ['starling', 'starling bank'] },
  { brand: 'nubank', icon: 'bank-outline', keywords: ['nubank', 'nu bank'] },
  { brand: 'chase', icon: 'bank-outline', keywords: ['chase', 'jpmorgan chase'] },
  { brand: 'boa', icon: 'bank-outline', keywords: ['bank of america', 'boa'] },
  { brand: 'wellsfargo', icon: 'bank-outline', keywords: ['wells fargo', 'wellsfargo'] },
  { brand: 'capitalone', icon: 'bank-outline', keywords: ['capital one', 'capitalone'] },
  { brand: 'citi', icon: 'bank-outline', keywords: ['citi', 'citibank'] },
  { brand: 'hsbc', icon: 'bank-outline', keywords: ['hsbc'] },
  { brand: 'santander', icon: 'bank-outline', keywords: ['santander'] },
  { brand: 'bbva', icon: 'bank-outline', keywords: ['bbva'] },
  { brand: 'ing', icon: 'bank-outline', keywords: ['ing bank', 'ing direct', 'ing'] },
  { brand: 'coinbase', icon: 'currency-usd', keywords: ['coinbase', 'coinbase vault'] },
  { brand: 'binance', icon: 'currency-btc', keywords: ['binance', 'binance account'] },
  { brand: 'kraken', icon: 'currency-btc', keywords: ['kraken', 'kraken pro'] },
  { brand: 'bybit', icon: 'currency-btc', keywords: ['bybit'] },
  { brand: 'kucoin', icon: 'currency-btc', keywords: ['kucoin'] },

  { brand: 'ledger', icon: 'wallet-outline', keywords: ['ledger', 'ledger nano', 'ledger live'] },
  { brand: 'trezor', icon: 'wallet-outline', keywords: ['trezor', 'trezor suite'] },
  { brand: 'coldcard', icon: 'wallet-outline', keywords: ['coldcard'] },
  { brand: 'seedsigner', icon: 'wallet-outline', keywords: ['seedsigner', 'seed signer'] },
  { brand: 'wallet', icon: 'wallet-outline', keywords: ['wallet', 'seed'] },

  { brand: 'bitwarden', icon: 'shield-key-outline', keywords: ['bitwarden', 'bitwarden vault'] },
  { brand: '1password', icon: 'shield-key-outline', keywords: ['1password', 'one password'] },
  { brand: 'lastpass', icon: 'shield-key-outline', keywords: ['lastpass', 'last pass'] },
  { brand: 'dashlane', icon: 'shield-key-outline', keywords: ['dashlane'] },
  { brand: 'okta', icon: 'shield-check-outline', keywords: ['okta'] },
  { brand: 'authy', icon: 'shield-key-outline', keywords: ['authy'] },
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
const WEBSITE_PATTERN = /((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+)/i;
const DOMAIN_HINTS = {
  atlassian: 'atlassian.com',
  attlasian: 'atlassian.com',
  booking: 'booking.com',
  coins: 'coins.co.th',
  currenxie: 'currenxie.com',
  dribbble: 'dribbble.com',
};
const BRAND_DOMAIN_HINTS = {
  airbnb: 'airbnb.com',
  aliexpress: 'aliexpress.com',
  amex: 'americanexpress.com',
  amazon: 'amazon.com',
  apple: 'apple.com',
  authy: 'authy.com',
  bbva: 'bbva.com',
  binance: 'binance.com',
  bitbucket: 'bitbucket.org',
  bitwarden: 'bitwarden.com',
  booking: 'booking.com',
  boa: 'bankofamerica.com',
  bunq: 'bunq.com',
  bybit: 'bybit.com',
  canva: 'canva.com',
  capitalone: 'capitalone.com',
  chase: 'chase.com',
  chime: 'chime.com',
  citi: 'citi.com',
  claude: 'claude.ai',
  coinbase: 'coinbase.com',
  discord: 'discord.com',
  disney: 'disneyplus.com',
  dashlane: 'dashlane.com',
  docker: 'docker.com',
  dribbble: 'dribbble.com',
  dropbox: 'dropbox.com',
  ea: 'ea.com',
  ebay: 'ebay.com',
  epicgames: 'epicgames.com',
  facebook: 'facebook.com',
  figma: 'figma.com',
  gitlab: 'gitlab.com',
  github: 'github.com',
  gmail: 'gmail.com',
  google: 'google.com',
  hbo: 'max.com',
  hsbc: 'hsbc.com',
  icloud: 'icloud.com',
  ing: 'ing.com',
  instagram: 'instagram.com',
  kraken: 'kraken.com',
  kucoin: 'kucoin.com',
  lastpass: 'lastpass.com',
  line: 'line.me',
  linkedin: 'linkedin.com',
  mercadolibre: 'mercadolibre.com',
  medium: 'medium.com',
  microsoft: 'microsoft.com',
  miro: 'miro.com',
  monzo: 'monzo.com',
  n26: 'n26.com',
  netflix: 'netflix.com',
  notion: 'notion.so',
  nubank: 'nubank.com.br',
  okta: 'okta.com',
  openai: 'openai.com',
  outlook: 'outlook.com',
  paypal: 'paypal.com',
  payoneer: 'payoneer.com',
  pinterest: 'pinterest.com',
  playstation: 'playstation.com',
  primevideo: 'primevideo.com',
  proton: 'proton.me',
  reddit: 'reddit.com',
  remitly: 'remitly.com',
  revolut: 'revolut.com',
  santander: 'santander.com',
  shopify: 'shopify.com',
  skype: 'skype.com',
  snapchat: 'snapchat.com',
  slack: 'slack.com',
  spotify: 'spotify.com',
  starling: 'starlingbank.com',
  stripe: 'stripe.com',
  telegram: 'telegram.org',
  threads: 'threads.net',
  trezor: 'trezor.io',
  tiktok: 'tiktok.com',
  twitch: 'twitch.tv',
  uber: 'uber.com',
  ubisoft: 'ubisoft.com',
  vimeo: 'vimeo.com',
  whatsapp: 'whatsapp.com',
  wechat: 'wechat.com',
  westernunion: 'westernunion.com',
  wellsfargo: 'wellsfargo.com',
  wise: 'wise.com',
  x: 'x.com',
  xbox: 'xbox.com',
  yahoo: 'yahoo.com',
  youtube: 'youtube.com',
  zoom: 'zoom.us',
};

const normalizeWebsiteDomain = (value = '') => {
  const normalized = normalize(value)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#:]/)[0]
    .replace(/\.+$/, '');
  if (!normalized || !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(normalized)) return '';

  const parts = normalized.split('.');
  const hasInvalidPart = parts.some((part) => !part || part.startsWith('-') || part.endsWith('-'));
  if (hasInvalidPart) return '';

  const tld = parts[parts.length - 1] || '';
  if (!/^[a-z]{2,63}$/.test(tld)) return '';

  return normalized;
};

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

const findServiceEntryByBrand = (brand = '') =>
  SERVICE_ICON_CATALOG.find(({ brand: entryBrand }) => entryBrand === normalize(brand));

const extractWebsiteDomain = (...values) => {
  for (const value of values) {
    const text = `${value || ''}`.trim();
    if (!text) continue;

    const match = text.match(WEBSITE_PATTERN);
    const domain = normalizeWebsiteDomain(match ? match[1] : text);
    if (domain) return domain;
  }

  const hintsHaystack = normalizeWords(...values);
  const hinted = Object.entries(DOMAIN_HINTS).find(([keyword]) => hasKeywordMatch(hintsHaystack, keyword));
  if (hinted) return hinted[1];
  const matched = findServiceEntry(hintsHaystack);
  if (matched?.brand && BRAND_DOMAIN_HINTS[matched.brand]) return BRAND_DOMAIN_HINTS[matched.brand];

  return '';
};

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

  const haystack = normalizeWords(name);
  const matched = findServiceEntry(haystack);
  const persisted = findServiceEntryByBrand(brand);

  if (persisted && (!haystack || matched?.brand === persisted.brand)) return persisted.icon;

  if (matched) return matched.icon;

  if (!haystack && brand && SERVICE_ICON_MAP[brand]) return SERVICE_ICON_MAP[brand];

  return type;
};

export { deriveSecretVisual, extractWebsiteDomain, resolveSecretIcon };
