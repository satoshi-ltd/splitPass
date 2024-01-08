import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  input: {
    borderColor: '$colorContentLight',
    borderRadius: '$borderRadius',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
    color: '$colorContent',
    fontFamily: '$inputFontFamily',
    fontSize: '$inputFontSize',
    // lineHeight: '$inputFontSize * 1.5',
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
