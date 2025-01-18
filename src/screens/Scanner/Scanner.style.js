import { Dimensions } from 'react-native';
import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    backgroundColor: '$scannerBackground',
    height: '100%',
  },

  container: {
    height: '100%',
  },

  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: Dimensions.get('window').width,
  },

  background: {
    backgroundColor: '$scannerBackgroundOpacity',
  },

  instructions: {
    paddingBottom: '$viewOffset',
  },

  instructionsContent: {
    maxWidth: '75%',
  },

  tabs: {
    alignSelf: 'center',
    marginBottom: '$viewOffset * 2',
    marginTop: '$viewOffset * 3',
    ...Platform.select({ web: { marginTop: '$viewOffset * 5' } }),
  },

  section: {
    flex: 1,
    height: '100%',
  },

  frame: {
    height: '$qrSize',
    width: '$qrSize',
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

  input: {
    backgroundColor: 'transparent',
    flex: 1,
  },

  text: {
    color: '$scannerTextColor',
  },

  reveal: {
    height: '100%',
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: '$viewOffset',

    backgroundColor: 'orange',
  },
  // --

  // -- Scanner.NFC (partial)
  scannerNFC: {
    width: '100%',
    // paddingBottom: '$viewOffset',
    // marginTop: '$viewOffset * 2',
    // maxWidth: '80%',
    // height: '80%',
  },
});
