import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '$colorAccent',
    borderRadius: '$buttonRadius',
    justifyContent: 'center',
    minHeight: '$buttonHeight',
    maxHeight: '$buttonHeight',
    overflow: 'hidden',
    paddingHorizontal: '$buttonHeight / 2',
  },

  disabled: {
    backgroundColor: '$colorDisabled',
  },

  secondary: {
    backgroundColor: 'transparent',
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
  },

  contrast: {
    borderColor: '$colorBase',
  },

  small: {
    minHeight: '$buttonSmallHeight',
    maxHeight: '$buttonSmallHeight',
    paddingHorizontal: '$buttonSmallHeight / 2',
  },

  wide: {
    flex: 1,
  },
});
