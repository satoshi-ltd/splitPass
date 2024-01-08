import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    borderColor: '$colorContentLight',
    borderRadius: '$borderRadius',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
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
    borderColor: '$colorContent',
  },

  valid: {
    borderColor: '$colorAccent',
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
