export * from './dark.theme';
export * from './light.theme';
export * from './theme';

export const resolveAppTheme = (mode = 'light') =>
  mode === 'dark' ? require('./dark.theme').DarkTheme : require('./light.theme').LightTheme;
