jest.mock('react-native', () => ({ Appearance: { getColorScheme: () => 'light' } }));

import { DarkTheme } from '../dark.theme';
import { LightTheme } from '../light.theme';
import { getAppColors } from '../theme';

const REQUIRED_STYLESHEET_TOKENS = [
  '$colorAccent',
  '$colorDark',
  '$colorLight',
  '$colorBase',
  '$colorSurface',
  '$colorBorder',
  '$colorContent',
  '$colorContentLight',
  '$colorDisabled',
  '$borderRadius',
  '$buttonRadius',
  '$spaceM',
];

const REQUIRED_APP_COLORS = [
  'text',
  'textSecondary',
  'accent',
  'onAccent',
  'background',
  'surface',
  'border',
  'danger',
  'warning',
  'success',
  'overlay',
  'inverse',
  'onInverse',
];

const channel = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

describe('theme — single source of truth', () => {
  it('exposes every stylesheet token consumed by screen styles (light and dark)', () => {
    REQUIRED_STYLESHEET_TOKENS.forEach((token) => {
      expect(LightTheme[token]).toBeDefined();
      expect(DarkTheme[token]).toBeDefined();
    });
  });

  it('exposes every app color consumed by primitives (light and dark)', () => {
    ['light', 'dark'].forEach((mode) => {
      const colors = getAppColors(mode);
      REQUIRED_APP_COLORS.forEach((key) => expect(colors[key]).toBeDefined());
    });
  });

  it('keeps the stylesheet and app-color systems in sync (no drift)', () => {
    ['light', 'dark'].forEach((mode) => {
      const stylesheet = mode === 'dark' ? DarkTheme : LightTheme;
      const colors = getAppColors(mode);

      expect(colors.accent.toLowerCase()).toBe(stylesheet.$colorAccent.toLowerCase());
      expect(colors.background.toLowerCase()).toBe(stylesheet.$colorBase.toLowerCase());
      expect(colors.surface.toLowerCase()).toBe(stylesheet.$colorSurface.toLowerCase());
      expect(colors.text.toLowerCase()).toBe(stylesheet.$colorContent.toLowerCase());
      expect(colors.border.toLowerCase()).toBe(stylesheet.$colorBorder.toLowerCase());
    });
  });

});

describe('theme — WCAG AA contrast audit', () => {
  it.each(['light', 'dark'])('meets AA (4.5:1) for text and state colors on %s', (mode) => {
    const c = getAppColors(mode);

    expect(contrast(c.text, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.textSecondary, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.textSecondary, c.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.onAccent, c.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.danger, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.warning, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.success, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.info, c.background)).toBeGreaterThanOrEqual(4.5);
  });
});
