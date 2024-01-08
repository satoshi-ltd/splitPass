import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  text: {
    fontFamily: 'font-default',
    fontWeight: '$fontWeightDefault',
  },

  bold: {
    fontFamily: 'font-bold',
    fontWeight: '$fontWeightBold',
  },

  // align
  left: {
    alignSelf: 'flex-start',
    textAlign: 'flex-start',
  },

  center: {
    alignSelf: 'center',
    textAlign: 'center',
  },

  right: {
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
});
