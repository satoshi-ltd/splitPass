import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    paddingTop: '$viewOffset * 5',
  },

  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },

  background: {
    backgroundColor: '$scannerBackgroundOpacity',
  },

  instructions: {
    paddingVertical: '$viewOffset * 2',
  },

  instructionsContent: {
    maxWidth: '66%',
  },

  tabs: {
    alignSelf: 'center',
    marginBottom: '$viewOffset * 2',
  },

  section: {
    backgroundColor: '$scannerBackgroundOpacity',
    // backgroundColor: 'rgba(0,255,0,0.1)',
    flex: 1,
    height: '100%',
    // padding: '$viewOffset',
  },

  frame: {
    height: '$qrSize',
    width: '$qrSize',
  },

  cardOptions: {
    gap: '$viewOffset / 2',
  },

  scanningText: {
    marginTop: '$viewOffset',
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
    color: '$qrBackgroundColor',
  },

  reveal: {
    height: '100%',
  },

  footer: {
    backgroundColor: '$scannerBackgroundOpacity',
    flex: 2,
    justifyContent: 'flex-end',
    paddingBottom: '$viewOffset * 2',
    paddingHorizontal: '$viewOffset',
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
