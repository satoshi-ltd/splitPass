import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    gap: '$viewOffset / 4',
    paddingHorizontal: '$viewOffset',
  },
});
