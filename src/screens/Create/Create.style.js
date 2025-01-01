import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  anchor: {
    borderColor: '$colorContent',
    borderStyle: '$borderStyle',
    borderTopWidth: '$borderWidth',
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
  },

  separator: {
    borderColor: '$colorContentLight',
    borderStyle: '$borderStyle',
    borderTopWidth: '$borderWidth',
    // opacity: 0.33,
  },

  rowSecure: {
    alignItems: 'center',
  },

  cardAlert: {
    gap: '$spaceS',
  },

  textAlert: {
    flex: 1,
  },

  cardForm: {
    paddingBottom: '$spaceXS',
    paddingTop: '$spaceXS',
  },

  field: {
    gap: '$viewOffset / 2',
    minHeight: '$spaceXXL + $spaceM',
    maxWidth: '100%',
  },

  input: {
    backgroundColor: 'transparent',
    flex: 1,
    fontSize: '$fontSizeCaption',
    paddingRight: 0,
  },
});
