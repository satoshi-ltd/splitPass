import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  input: {
    backgroundColor: '$inputBackgroundColor',
    borderColor: '$inputBorderColor',
    borderRadius: '$borderRadius',
    borderStyle: '$inputBorderStyle',
    borderWidth: '$inputBorderWidth',
    color: '$colorContent',
    fontFamily: '$inputFontFamily',
    fontSize: '$inputFontSize',
    fontWeight: '$inputFontWeight',
    paddingLeft: '$spaceM',
    paddingRight: '$spaceM',
    paddingBottom: '$spaceM',
    paddingTop: '$spaceM',
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
    width: '100%',
  },

  focus: {
    borderColor: '$inputBorderColorFocus',
  },

  valid: {
    borderColor: '$inputBorderColorValid',
  },

  // align
  left: {
    textAlign: 'left',
  },

  center: {
    textAlign: 'center',
  },

  right: {
    textAlign: 'right',
  },
});
