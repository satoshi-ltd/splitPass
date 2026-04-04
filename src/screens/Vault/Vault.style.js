import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    paddingBottom: '$viewOffset',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$viewOffset * 4',
  },

  input: {
    backgroundColor: '$inputBackgroundColor',
  },

  clearButton: {
    alignItems: 'center',
    height: '$spaceL',
    justifyContent: 'center',
    width: '$spaceL',
  },
});
