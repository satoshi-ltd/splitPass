import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  card: {
    backgroundColor: '$cardColor',
    borderRadius: '$borderRadius',
    gap: '$spaceM',
    padding: '$spaceM',
    width: '100%',
  },

  outlined: {
    backgroundColor: 'transparent',
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
  },
});
