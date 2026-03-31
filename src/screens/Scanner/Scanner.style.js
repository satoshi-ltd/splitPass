import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_FRAME_SIZE = 232;
const MASK_SIDE_WIDTH = Math.max(0, (SCREEN_WIDTH - QR_FRAME_SIZE) / 2);

export const style = StyleSheet.create({
  screen: {
    backgroundColor: '$scannerBackground',
    height: '100%',
    paddingBottom: 0,
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
    zIndex: 0,
  },

  background: {
    backgroundColor: '$scannerBackgroundOpacity',
    zIndex: 1,
  },

  headerTabs: {
    width: 128,
  },

  instructions: {
    paddingBottom: '$spaceS',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$spaceM',
  },

  instructionsContent: {
    maxWidth: '75%',
  },

  tabs: {
    width: '100%',
  },

  section: {
    flex: 1,
    height: '100%',
  },

  stage: {
    flex: 1,
    justifyContent: 'center',
  },

  qrFrameStage: {
    flex: 1,
    width: '100%',
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
    width: '100%',
    zIndex: 1,
  },

  footerAccent: {
    backgroundColor: '$colorAccent',
  },

  footerSafeArea: {
    backgroundColor: '$colorAccent',
  },

  footerInner: {
    paddingHorizontal: '$viewOffset',
    paddingTop: '$spaceM',
    paddingBottom: '$spaceXS',
  },

  footerReveal: {
    marginBottom: '$spaceS',
  },

  footerMenuWrap: {
    bottom: '$spaceXL + $spaceM',
    position: 'absolute',
    right: '$viewOffset',
  },

  footerMenuBackdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  // -- Scanner.QR (partial)

  // -- Scanner.NFC (partial)
  scannerNFC: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },

  scannerQR: {
    flex: 1,
    width: '100%',
  },

  scannerMask: {
    backgroundColor: '$scannerBackgroundOpacity',
    position: 'absolute',
  },

  maskTop: {
    left: 0,
    right: 0,
    top: 0,
    height: '31%',
  },

  maskMiddle: {
    alignItems: 'center',
    height: '$qrSize',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '31%',
  },

  maskSide: {
    height: '$qrSize',
    top: 0,
    width: MASK_SIDE_WIDTH,
  },

  maskSideLeft: {
    left: 0,
  },

  maskSideRight: {
    right: 0,
  },

  maskBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    top: '31%',
    marginTop: '$qrSize',
  },
});
