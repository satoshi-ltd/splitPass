import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    paddingBottom: '$viewOffset * 2',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$viewOffset * 5',
  },

  header: {
    width: '80%',
    marginBottom: '$viewOffset',
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  input: {
    backgroundColor: '$inputBackgroundColor',
  },
});
