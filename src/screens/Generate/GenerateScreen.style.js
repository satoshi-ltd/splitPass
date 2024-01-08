import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    gap: '$spaceM',
    padding: '$spaceM',
  },

  anchor: {
    borderColor: '$colorContentLight',
    borderStyle: '$borderStyle',
    borderTopWidth: 1,
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
    opacity: 0.25,
  },

  rowEncryptedShard: {
    alignItems: 'center',
  },
});
