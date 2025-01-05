import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  switch: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '$borderRadius / 2',
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
    height: '$spaceL',
    width: '$spaceL',
  },

  disabled: {
    borderColor: '$colorDisabled',
  },

  check: {
    backgroundColor: '$colorContent',
    borderRadius: '$borderRadius / 4',
    height: '$spaceM',
    width: '$spaceM',
  },

  checkDisabled: {
    backgroundColor: '$colorContentLight',
  },
});
