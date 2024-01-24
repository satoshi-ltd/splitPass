import { DefaultTheme } from '@react-navigation/native';
import StyleSheet from 'react-native-extended-stylesheet';

// ! TODO: Should memoize this
export const getNavigationTheme = () => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: StyleSheet.value('$colorAccent'),
    background: StyleSheet.value('$colorBase'),
    card: StyleSheet.value('$colorBase'),
    text: StyleSheet.value('$colorContentLight'),
    border: 'transparent',
  },
});
