import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  card: {
    borderRadius: '$borderRadius',
    padding: '$spaceM',
    width: '100%',
  },

  outlined: {
    backgroundColor: '$colorBase',
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
  },

  small: {
    padding: '$spaceS',
  },
});
