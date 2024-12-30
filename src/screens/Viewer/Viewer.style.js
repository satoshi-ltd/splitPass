import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  modan: {
    paddingTop: '$spaceXXL',
    backgroundColor: 'blue',
  },

  scrollView: {
    marginLeft: '$viewOffset * -1',
    marginRight: '$viewOffset * -1',
  },

  item: {
    alignSelf: 'flex-end',
    flex: 1,
    justifyContent: 'flex-end',
  },

  name: {
    marginVertical: '$viewOffset / 2',
  },

  footer: {
    gap: '$spaceM',
    marginTop: '$viewOffset',
    paddingHorizontal: '$viewOffset / 2',
  },

  option: {
    flex: 1,
  },

  pagination: {
    top: `$viewOffset * -1.5`,
  },

  optionCard: {
    gap: '$viewOffset / 4',
    paddingHorizontal: '$viewOffset',
  },
});
