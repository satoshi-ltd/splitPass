import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  header: {
    gap: '$viewOffset',
    ...Platform.select({ web: { marginRight: '$viewOffset' } }),
  },
});
