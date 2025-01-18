import { DefaultTheme } from '@react-navigation/native';
import StyleSheet from 'react-native-extended-stylesheet';

import { DarkTheme } from '../theme';

// ! TODO: Should memoize this
export const getNavigationTheme = (route) => {
  if (route === 'scanner') {
    return {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: DarkTheme.$colorAccent,
        background: DarkTheme.$colorBase,
        card: DarkTheme.$colorBase,
        text: DarkTheme.$colorContent,
        border: 'transparent',
      },
    };
  }

  return {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: StyleSheet.value('$colorAccent'),
      background: StyleSheet.value('$colorBase'),
      card: StyleSheet.value('$colorBase'),
      text: StyleSheet.value('$colorContent'),
      border: 'transparent',
    },
  };
};
