import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  popup: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '$colorBase',
    padding: 10,
    zIndex: 1000,
  },

  popupUp: {
    top: '100%',
  },

  popupDown: {
    bottom: '100%',
  },

  target: {
    position: 'relative',
  },
});
