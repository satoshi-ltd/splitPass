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
    paddingLeft: '$inputPaddingHorizontaL',
    paddingRight: '$inputPaddingHorizontaL',
    paddingBottom: '$inputPaddingVertical',
    paddingTop: '$inputPaddingVertical',
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },

  error: {
    borderColor: '$inputBorderColorFocus',
  },

  focus: {
    backgroundColor: '$inputBackgroundColorFocus',
    borderColor: '$inputBorderColorFocus',
  },

  valid: {
    backgroundColor: '$inputBackgroundColorFocus',
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
