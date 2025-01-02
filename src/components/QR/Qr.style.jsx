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
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: '100%',
    left: 0,
    padding: '$viewOffset',
    margin: '$viewOffset / 2',
    top: 0,
    width: '100%',
    ...Platform.select({ web: { margin: 0 } }),
  },
});
