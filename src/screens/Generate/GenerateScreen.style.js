import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  anchor: {
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderTopWidth: 2,
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
    // opacity: 0.5,
  },

  rowSecure: {
    alignItems: 'center',
  },

  cardAlert: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0,
    gap: '$spaceXS',
  },

  cardInput: {
    gap: '$spaceXS',
    paddingTop: '$spaceS',
  },
});
