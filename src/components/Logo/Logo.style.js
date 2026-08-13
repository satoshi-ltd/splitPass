import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  compact: {
    fontSize: '$fontSizeTitle * 0.8',
    lineHeight: '$fontSizeTitle',
  },
  large: {
    fontSize: '$fontSizeTitle * 1.6',
    lineHeight: '$fontSizeTitle * 2',
  },
});
