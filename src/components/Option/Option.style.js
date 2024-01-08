import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  option: {
    borderColor: 'transparent',
    borderStyle: '$borderStyle',
    borderWidth: '$borderWidth',
    borderRadius: '$borderRadius',
    flex: 1,
    padding: '$spaceS',
  },

  checked: {
    borderColor: '$colorContent',
  },

  disabled: {
    borderColor: '$colorContentLight',
  },

  content: {
    alignItems: 'center',
    gap: '$spaceS',
    paddingBottom: '$spaceXS',
  },
});
