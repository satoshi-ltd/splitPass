import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { getAppColors } from '../theme';

export const getNavigationTheme = (mode = 'light') => {
  const colors = getAppColors(mode);
  const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

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
