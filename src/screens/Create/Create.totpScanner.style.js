import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  sheet: {
    width: '100%',
  },

  cameraShell: {
    backgroundColor: '$colorDark',
    borderRadius: 0,
    height: 320,
    overflow: 'hidden',
    position: 'relative',
  },

  camera: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  frame: {
    borderColor: '$colorAccent',
    borderWidth: 2,
    height: 184,
    left: '50%',
    marginLeft: -92,
    marginTop: -92,
    position: 'absolute',
    top: '50%',
    width: 184,
  },

  cameraOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: '$spaceM',
    position: 'absolute',
    right: 0,
    top: 0,
  },

  overlayCard: {
    backgroundColor: '$scannerBackgroundOpacity',
    gap: '$spaceS',
    padding: '$spaceM',
    width: '100%',
  },

  button: {
    borderRadius: 0,
    minHeight: '$spaceXL + $spaceS',
  },
});
