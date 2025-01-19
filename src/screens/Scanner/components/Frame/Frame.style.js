import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  frame: {
    height: '$qrSize',
    width: '$qrSize',
    padding: '$viewOffset',
  },

  card: {
    height: '$splitCardHeight + $viewOffset',
    width: '$splitCardWidth + $viewOffset',
  },

  corner: {
    borderColor: '$colorAccent',
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
});
