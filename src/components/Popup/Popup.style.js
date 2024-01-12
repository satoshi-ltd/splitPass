import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '$colorBase',
    padding: 10,
    zIndex: 1000,
  },

  target: {
    position: 'relative',
  },
});
