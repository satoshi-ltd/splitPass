import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  headerRight: {
    gap: '$viewOffset',
    ...Platform.select({ web: { marginHorizontal: '$viewOffset' } }),
  },

  buttonBack: {
    ...Platform.select({ web: { marginLeft: '$viewOffset' } }),
  },

  header: {
    backgroundColor: 'orange',
  },
});
