import { Platform } from 'react-native';
import { Dimensions } from 'react-native';
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
    right: 0,
    bottom: 0,
    zIndex: -1,
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

  input: {
    height: '$viewOffset * 4.5',
  },

  text: {
    color: '$scannerTextColor',
  },

  revealNFC: {
    backgroundColor: '$scannerBackgroundOpacity',
    position: 'absolute',
    top: '$viewOffset * 4.75',
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: '$viewOffset',
    backgroundColor: 'orange',
  },

  cardOptions: {
    gap: '$viewOffset / 2',
  },

  // -- Scanner.QR (partial)

  // -- Scanner.NFC (partial)
  scannerNFC: {
    maxHeight: `${Dimensions.get('window').height} * 0.65`,
    width: '100%',
  },
});
