import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL * 2',
    paddingTop: '$spaceXXL + $viewOffset',
    ...Platform.select({ web: { marginTop: '$viewOffset' } }),
  },

  hint: {
    marginTop: '$spaceXS',
  },

  offset: {
    marginHorizontal: '$spaceM',
    width: 'auto',
  },
});
