import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    paddingBottom: '$viewOffset',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$viewOffset * 5',
  },

  scrollview: {
    flex: 1,
    // paddingTop: '$viewOffset * 4',
  },
});
