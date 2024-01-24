import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  anchor: {
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderTopWidth: '$borderWidth',
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
  },

  rowSecure: {
    alignItems: 'center',
  },

  cardAlert: {
    gap: '$spaceXS',
  },

  cardInput: {
    gap: '$spaceXS',
    paddingTop: '$spaceS',
  },
});
