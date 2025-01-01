import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
  },

  scrollview: {
    flex: 1,
    paddingBottom: '$viewOffset',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$viewOffset',
    ...Platform.select({ web: { paddingTop: '$viewOffset * 5' } }),
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

  caption: {
    marginBottom: '$viewOffset / 2',
  },

  vaults: {
    flexWrap: 'wrap',
    gap: '$viewOffset / 2',
  },

  buttonAdd: {
    position: 'absolute',
    bottom: '$viewOffset',
    right: '$viewOffset',
  },
});
