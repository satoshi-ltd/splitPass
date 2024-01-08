import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '$colorAccent',
    borderRadius: '$buttonRadius',
    flex: 0,
    justifyContent: 'center',
    minHeight: '$buttonHeight',
    maxHeight: '$buttonHeight',
    overflow: 'hidden',
    paddingHorizontal: '$buttonHeight / 2',
  },

  disabled: {
    backgroundColor: '$colorContentLight',
  },

  secondary: {
    backgroundColor: 'transparent',
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
  },

  small: {
    minHeight: '$buttonSmallHeight',
    maxHeight: '$buttonSmallHeight',
    paddingHorizontal: '$buttonSmallHeight / 2',
  },
});
