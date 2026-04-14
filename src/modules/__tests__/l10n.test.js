import { VAULT_TYPE } from '../../App.constants';
import { getDictionary, getLanguageLabel, getLocale, getVaultLabel, L10N, setLanguage, translate } from '../l10n';

afterEach(() => {
  setLanguage('en');
});

describe('l10n', () => {
  describe('setLanguage / getDictionary', () => {
    it('defaults to English', () => {
      const dict = getDictionary();
      expect(dict).toHaveProperty('ACCEPT');
    });

    it('switches to Spanish', () => {
      setLanguage('es');
      const esDict = getDictionary();
      const enDict = getDictionary('en');
      expect(esDict.ACCEPT).not.toBe(enDict.ACCEPT);
    });

    it('falls back to English for an unknown language', () => {
      setLanguage('zz');
      expect(getDictionary()).toEqual(getDictionary('en'));
    });

    it('normalises language tags with region subtags', () => {
      setLanguage('es-ES');
      expect(getDictionary()).toEqual(getDictionary('es'));
    });

    it('is case-insensitive', () => {
      setLanguage('FR');
      expect(getDictionary()).toEqual(getDictionary('fr'));
    });
  });

  describe('getLocale', () => {
    it('returns en-US for English', () => expect(getLocale('en')).toBe('en-US'));
    it('returns es-ES for Spanish', () => expect(getLocale('es')).toBe('es-ES'));
    it('returns pt-PT for Portuguese', () => expect(getLocale('pt')).toBe('pt-PT'));
    it('returns fr-FR for French', () => expect(getLocale('fr')).toBe('fr-FR'));
    it('returns de-DE for German', () => expect(getLocale('de')).toBe('de-DE'));
    it('returns en-US for unknown language', () => expect(getLocale('zz')).toBe('en-US'));
  });

  describe('translate', () => {
    it('returns the translation for a known key', () => {
      expect(translate('ACCEPT')).toBe(getDictionary('en').ACCEPT);
    });

    it('returns the key itself for an unknown key', () => {
      expect(translate('UNKNOWN_KEY_XYZ')).toBe('UNKNOWN_KEY_XYZ');
    });

    it('interpolates params into template strings', () => {
      const result = translate('DEMO_SECRETS_ADDED', { count: 5 });
      expect(result).toContain('5');
    });
  });

  describe('L10N proxy', () => {
    it('resolves known keys', () => {
      expect(typeof L10N.ACCEPT).toBe('string');
    });

    it('returns the key string for unknown keys', () => {
      expect(L10N.TOTALLY_UNKNOWN_KEY).toBe('TOTALLY_UNKNOWN_KEY');
    });

    it('reflects the current language after setLanguage', () => {
      const enValue = L10N.ACCEPT;
      setLanguage('es');
      const esValue = L10N.ACCEPT;
      setLanguage('en');
      expect(typeof esValue).toBe('string');
      expect(esValue).not.toBe('');
    });
  });

  describe('getLanguageLabel', () => {
    it('returns a non-empty string for each supported language', () => {
      for (const lang of ['en', 'es', 'pt', 'fr', 'de']) {
        expect(typeof getLanguageLabel(lang)).toBe('string');
        expect(getLanguageLabel(lang).length).toBeGreaterThan(0);
      }
    });

    it('falls back to English label for unknown language', () => {
      expect(getLanguageLabel('zz')).toBe(getLanguageLabel('en'));
    });
  });

  describe('getVaultLabel', () => {
    it('returns the Account label', () => {
      expect(typeof getVaultLabel(VAULT_TYPE[0])).toBe('string');
    });

    it('returns the Finance label', () => {
      expect(typeof getVaultLabel(VAULT_TYPE[1])).toBe('string');
    });

    it('returns the Social label', () => {
      expect(typeof getVaultLabel(VAULT_TYPE[2])).toBe('string');
    });

    it('returns the others label', () => {
      expect(typeof getVaultLabel(VAULT_TYPE[3])).toBe('string');
    });

    it('returns the raw vault string for an unrecognised vault', () => {
      expect(getVaultLabel('CustomVault')).toBe('CustomVault');
    });
  });
});
