import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
  },

  scrollviewContentContainer: {
    paddingBottom: '$viewOffset',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$viewOffset * 5',
  },

  section: {
    marginBottom: '$viewOffset',
  },

  cardActions: {
    gap: '$viewOffset / 2',
  },

  cardAction: {
    flex: 1,
  },

  vaults: {
    flexWrap: 'wrap',
    gap: '$viewOffset / 2',
    marginTop: '$viewOffset / 2',
  },

  buttonAdd: {
    position: 'absolute',
    bottom: '$viewOffset',
    right: '$viewOffset',
  },
});
