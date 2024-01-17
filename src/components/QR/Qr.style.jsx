import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  solid: {
    backgroundColor: '$qrBackgroundColor',
    borderRadius: '$borderRadius',
  },

  inline: {
    backgroundColor: 'transparent',
  },
});
