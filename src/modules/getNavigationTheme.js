import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { getAppColors, resolveThemeMode } from '../theme';

export const getNavigationTheme = (preference = 'light', scheme) => {
  const resolvedMode = resolveThemeMode(preference, scheme);
  const colors = getAppColors(resolvedMode);
  const baseTheme = resolvedMode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: 'transparent',
      notification: colors.accent,
    },
  };
};
