import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    width: Dimensions.get('window').width,
  },

  scanner: {
    backgroundColor: '$importBackgroundColor',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  section: {
    backgroundColor: '$importBackgroundColor',
    padding: '$spaceXL',
  },

  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: '$spaceXL * 2',
  },

  footer: {
    flex: 2,
    paddingTop: '$spaceXL * 2',
  },

  frame: {
    height: '$qrSize',
    width: '$qrSize',
  },

  corner: {
    borderColor: '$importColor',
    width: '$qrSize / 4',
    height: '$qrSize / 4',
    position: 'absolute',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: '$borderWidth * 2',
    borderLeftWidth: '$borderWidth * 2',
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: '$borderWidth * 2',
    borderRightWidth: '$borderWidth * 2',
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: '$borderWidth * 2',
    borderLeftWidth: '$borderWidth * 2',
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: '$borderWidth * 2',
    borderRightWidth: '$borderWidth * 2',
  },

  text: {
    color: '$importColor',
  },
});
