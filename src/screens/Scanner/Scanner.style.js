import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';

export const style = StyleSheet.create({
  screen: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },

  scanner: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  header: {
    backgroundColor: '$importBackgroundColor',
    ...Platform.select({ web: { paddingTop: '$viewOffset' } }),
  },

  headerLeft: {
    marginLeft: '$viewOffset',
    justifyContent: 'flex-start',
    width: '$spaceXXL * 2',
  },

  headerRight: {
    marginRight: '$viewOffset',
    justifyContent: 'flex-end',
    width: '$spaceXXL * 2',
  },

  section: {
    backgroundColor: '$importBackgroundColor',
    flex: 1,
    height: '100%',
    padding: '$viewOffset',
  },

  footer: {
    flex: 2,
    paddingVertical: '$viewOffset * 2',
  },

  frame: {
    height: '$qrSize',
    width: '$qrSize',
  },

  cardOptions: {
    gap: '$viewOffset / 2',
  },

  corner: {
    borderColor: '$qrBackgroundColor',
    width: '$qrSize / 8',
    height: '$qrSize / 8',
    position: 'absolute',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: '$spaceXS',
    borderLeftWidth: '$spaceXS',
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: '$spaceXS',
    borderRightWidth: '$spaceXS',
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: '$spaceXS',
    borderLeftWidth: '$spaceXS',
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: '$spaceXS',
    borderRightWidth: '$spaceXS',
  },

  text: {
    color: '$qrBackgroundColor',
  },
});
