import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  item: {
    paddingVertical: '$viewOffset / 4',
  },

  items: {
    marginBottom: '$viewOffset',
  },

  lifetime: {
    marginBottom: '$spaceM + 2',
  },

  modal: {
    paddingTop: '$viewOffset',
  },

  pressableTerms: {
    height: '$fontSizeTiny',
    lineHeight: '$fontSizeTiny * $lineHeightDefaultRatio',
  },

  title: {
    gap: '$viewOffset / 2',
    marginTop: '$viewOffset',
  },
});
