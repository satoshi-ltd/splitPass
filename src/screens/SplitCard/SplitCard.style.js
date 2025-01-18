import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    paddingBottom: '$viewOffset * 2',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$viewOffset * 4',
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  input: {
    backgroundColor: '$inputBackgroundColor',
  },
});
