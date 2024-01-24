import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  accent: {
    color: '$colorAccent',
  },

  base: {
    color: '$colorBase',
  },

  border: {
    color: '$colorBorder',
  },

  content: {
    color: '$colorContent',
  },

  contentLight: {
    color: '$colorContentLight',
  },

  disabled: {
    color: '$colorDisabled',
  },

  error: {
    color: '$colorError',
  },

  success: {
    color: '$colorSuccess',
  },

  warning: {
    color: '$colorWarning',
  },
});

export const getColor = (value) => style[value];
