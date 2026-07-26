import { Appearance } from 'react-native';

import { palette, radius, radiusFull } from './palette';

const toAppColors = (p) => ({
  text: p.content,
  textSecondary: p.contentMuted,
  accent: p.accent,
  onAccent: p.onAccent,
  background: p.background,
  surface: p.surface,
  surfaceRaised: p.surfaceRaised,
  border: p.border,
  disabled: p.disabled,
  qrBackground: p.qrBackground,
  qrForeground: p.qrForeground,
  danger: p.danger,
  onDanger: p.onDanger,
  warning: p.warning,
  onWarning: p.onWarning,
  success: p.success,
  onSuccess: p.onSuccess,
  info: p.info,
  onInfo: p.onInfo,
  overlay: p.overlay,
  inverse: p.inverse,
  onInverse: p.onInverse,
  onScrim: p.onScrim,
});

export const theme = {
  colors: {
    dark: toAppColors(palette.dark),
    light: toAppColors(palette.light),
  },
  typography: {
    fontFaces: {
      primary: {
        regular: 'font-default',
        bold: 'font-bold',
      },
      secondary: {
        regular: 'font-default-secondary',
        bold: 'font-bold-secondary',
      },
    },
    sizes: {
      tiny: 11,
      caption: 13,
      body: 15,
      input: 16,
      subtitle: 20,
      title: 26,
    },
    lineHeights: {
      tiny: 14,
      caption: 16,
      body: 20,
      input: 20,
      subtitle: 24,
      title: 30,
    },
    iconSizes: {
      tiny: 12,
      caption: 16,
      body: 20,
      subtitle: 24,
      title: 30,
    },
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius,
  radiusFull,
  borderRadius: { sm: radius, md: radius, lg: radius, xl: radius, full: radiusFull },
  animations: {
    duration: {
      quick: 220,
      standard: 320,
    },
  },
};

const THEME_PREFERENCES = ['light', 'dark', 'system'];

export const normalizeThemePreference = (value = 'light') => {
  if (!value) return 'light';
  const normalized = `${value}`.toLowerCase();

  return THEME_PREFERENCES.includes(normalized) ? normalized : 'light';
};

export const resolveThemeMode = (preference = 'light', scheme) => {
  const normalized = normalizeThemePreference(preference);
  if (normalized !== 'system') return normalized;

  const systemScheme = scheme || Appearance.getColorScheme();
  return systemScheme === 'dark' ? 'dark' : 'light';
};

export const getAppColors = (preference = 'light', scheme) =>
  theme.colors[resolveThemeMode(preference, scheme)] || theme.colors.light;
