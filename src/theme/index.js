import { resolveThemeMode } from './theme';

export * from './dark.theme';
export * from './light.theme';
export * from './theme';

export const resolveAppTheme = (preference = 'light', scheme) =>
  resolveThemeMode(preference, scheme) === 'dark'
    ? require('./dark.theme').DarkTheme
    : require('./light.theme').LightTheme;
