import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '$viewOffset',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    zIndex: 1,
  },

  options: {
    gap: '$viewOffset / 2',
  },
});
