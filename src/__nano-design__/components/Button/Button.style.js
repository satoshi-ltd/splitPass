import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: '$buttonRadius',
    justifyContent: 'center',
    minHeight: '$buttonHeight',
    maxHeight: '$buttonHeight',
    overflow: 'hidden',
    paddingHorizontal: '$buttonHeight / 2',
  },

  disabled: {
    backgroundColor: '$colorBorder',
  },

  flex: {
    flex: 1,
  },

  outlined: {
    backgroundColor: '$colorBase',
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
  },

  primary: {
    backgroundColor: '$buttonColorPrimary',
  },

  secondary: {
    backgroundColor: '$buttonColorSecondary',
  },

  small: {
    minHeight: '$buttonSmallHeight',
    maxHeight: '$buttonSmallHeight',
    paddingHorizontal: '$buttonSmallHeight / 2',
  },
});
