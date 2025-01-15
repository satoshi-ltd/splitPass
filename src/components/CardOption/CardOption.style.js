import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    flex: 1,
  },

  squared: {
    flex: 0,
    maxWidth: '$viewOffset * 4.35',
    minWidth: '$viewOffset * 4.35',
  },

  content: {
    gap: '$viewOffset / 2',
    paddingHorizontal: '$viewOffset',
    minHeight: '$viewOffset * 4.35',
  },
});
