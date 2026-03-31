import { VAULT_TYPE } from '../App.constants';
import { DE, EN, ES, FR, PT } from './l10n.dictionaries';

const dictionaries = { de: DE, en: EN, es: ES, fr: FR, pt: PT };

let currentLanguage = 'en';

const normalizeLanguage = (language) => {
  if (!language) return 'en';

  const value = `${language}`.toLowerCase();
  const normalized = value.includes('-') ? value.split('-')[0] : value;

  return dictionaries[normalized] ? normalized : 'en';
};

const getLocale = (language = currentLanguage) => {
  const normalized = normalizeLanguage(language);

  if (normalized === 'es') return 'es-ES';
  if (normalized === 'pt') return 'pt-PT';
  if (normalized === 'fr') return 'fr-FR';
  if (normalized === 'de') return 'de-DE';

  return 'en-US';
};

const getDictionary = (language = currentLanguage) => dictionaries[normalizeLanguage(language)] || dictionaries.en;

const getFallbackDictionary = () => dictionaries.en;

const interpolate = (value, params = {}) => {
  if (typeof value !== 'string') return value;

  return value.replace(/\{(\w+)\}/g, (_, key) => (params[key] !== undefined ? params[key] : `{${key}}`));
};

const translate = (key, params = {}) => {
  const dict = getDictionary(currentLanguage);
  const value = dict[key];

  if (typeof value === 'function') return value(params);
  if (value !== undefined) return interpolate(value, params);

  const fallback = getFallbackDictionary();
  const fallbackValue = fallback[key];

  if (typeof fallbackValue === 'function') return fallbackValue(params);

  return fallbackValue !== undefined ? interpolate(fallbackValue, params) : key;
};

const L10N = new Proxy(
  {},
  {
    get: (_, key) => {
      if (typeof key !== 'string') return undefined;

      const dict = getDictionary(currentLanguage);
      if (dict[key] !== undefined) return dict[key];

      const fallback = getFallbackDictionary();
      return fallback[key] !== undefined ? fallback[key] : key;
    },
  },
);

const setLanguage = (language) => {
  currentLanguage = normalizeLanguage(language);
};

const detectDeviceLanguage = () => {
  try {
    return normalizeLanguage(Intl.DateTimeFormat().resolvedOptions().locale || 'en');
  } catch {
    return 'en';
  }
};

const formatDateTime = (date, language = currentLanguage, options = {}) => {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat(getLocale(language), options).format(date);
  } catch {
    return `${date}`;
  }
};

const getLanguageLabel = (language) => {
  const normalized = normalizeLanguage(language);

  if (normalized === 'es') return L10N.LANGUAGE_ES;
  if (normalized === 'pt') return L10N.LANGUAGE_PT;
  if (normalized === 'fr') return L10N.LANGUAGE_FR;
  if (normalized === 'de') return L10N.LANGUAGE_DE;

  return L10N.LANGUAGE_EN;
};

const getVaultLabel = (vault) => {
  if (vault === VAULT_TYPE[0]) return L10N.VAULT_ACCOUNT;
  if (vault === VAULT_TYPE[1]) return L10N.VAULT_FINANCE;
  if (vault === VAULT_TYPE[2]) return L10N.VAULT_SOCIAL;
  if (vault === VAULT_TYPE[3]) return L10N.VAULT_OTHERS;

  return vault;
};

export {
  detectDeviceLanguage,
  formatDateTime,
  getDictionary,
  getLanguageLabel,
  getLocale,
  getVaultLabel,
  L10N,
  setLanguage,
  translate,
};
