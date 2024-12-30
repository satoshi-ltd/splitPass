import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    // paddingTop: '$viewOffset * 4',
    ...Platform.select({ web: { paddingTop: '$spaceXXL + $spaceXL' } }),
    // backgroundColor: 'orange',
  },

  header: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: '$viewOffset',
    paddingVertical: '$viewOffset / 2',
    width: '100%',
    zIndex: 1,
  },

  scrollview: {
    flex: 1,
    // paddingTop: '$viewOffset * 5',
    paddingHorizontal: '$viewOffset',
    paddingBottom: '$viewOffset',
  },

  section: {
    marginBottom: '$viewOffset',
  },

  items: {
    marginBottom: '$viewOffset',
    marginTop: '$viewOffset / 2',
  },

  item: {
    gap: '$viewOffset / 2',
  },

  thumbnail: {
    backgroundColor: '$colorBorder',
    borderRadius: '$spaceXXL / 2',
    height: '$spaceXXL',
    width: '$spaceXXL',
  },

  buttons: {
    position: 'absolute',
    bottom: '$viewOffset',
    right: '$viewOffset',
  },
});
