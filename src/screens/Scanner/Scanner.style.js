import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    backgroundColor: '$scannerBackground',
    flex: 1,
    paddingBottom: 0,
  },

  container: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
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
  permissionCard: {
    alignItems: 'center',
    backgroundColor: '$scannerBackgroundOpacity',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: '$viewOffset',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  permissionContent: {
    gap: '$spaceS',
    maxWidth: '80%',
  },
  permissionCaption: {
    maxWidth: '100%',
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
  },

  stage: {
    flex: 1,
    justifyContent: 'center',
  },

  qrFrameStage: {
    flex: 1,
    marginTop: -1,
    width: '100%',
    justifyContent: 'center',
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
    flexShrink: 0,
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
    flexShrink: 0,
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
  },

  maskTop: {
    flex: 1,
    width: '100%',
  },

  maskMiddle: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '$qrSize',
    justifyContent: 'center',
    width: '100%',
  },

  maskSide: {
    flex: 1,
    height: '$qrSize',
  },

  maskBottom: {
    flex: 1,
    width: '100%',
  },
});
