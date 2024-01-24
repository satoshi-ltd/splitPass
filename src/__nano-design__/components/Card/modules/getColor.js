import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  accent: {
    backgroundColor: '$colorAccent',
  },

  base: {
    backgroundColor: '$colorBase',
  },

  border: {
    backgroundColor: '$colorBorder',
  },

  content: {
    backgroundColor: '$colorContent',
  },

  contentLight: {
    backgroundColor: '$colorContentLight',
  },

  disabled: {
    backgroundColor: '$colorDisabled',
  },

  error: {
    backgroundColor: '$colorError',
  },

  success: {
    backgroundColor: '$colorSuccess',
  },

  warning: {
    backgroundColor: '$colorWarning',
  },
});

export const getColor = (value) => style[value] || style.border;
