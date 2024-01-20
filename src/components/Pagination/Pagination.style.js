import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  pagination: {
    gap: '$spaceXS',
    justifyContent: 'center',
  },

  dot: {
    backgroundColor: '$colorDisabled',
    borderRadius: '$borderRadius',
    height: '$spaceXS',
    maxWidth: '$spaceM',
    width: '$spaceM',
  },

  dotActive: {
    backgroundColor: '$colorAccent',
  },
});
