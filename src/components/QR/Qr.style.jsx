import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '$qrBackgroundColor',
    borderRadius: '$borderRadius',
    justifyContent: 'center',
    padding: '$viewOffset / 2',
  },

  secret: {
    backgroundColor: '$modalOverflowBackgroundColor',
    height: '100%',
    left: 0,
    padding: '$viewOffset',
    margin: '$viewOffset / 2',
    opacity: 0.75,
    position: 'absolute',
    top: 0,
    width: '100%',
    ...Platform.select({ web: { margin: 0 } }),
  },
});
