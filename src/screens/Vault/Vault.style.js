import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    paddingBottom: '$viewOffset',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$viewOffset',
    ...Platform.select({ web: { paddingTop: '$viewOffset * 5' } }),
  },

  scrollview: {
    flex: 1,
    // paddingTop: '$viewOffset * 4',
  },
});
