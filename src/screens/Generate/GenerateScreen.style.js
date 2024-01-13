import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  anchor: {
    borderColor: '$colorContentLight',
    borderStyle: '$borderStyle',
    borderTopWidth: 1,
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
    opacity: 0.25,
  },

  textGuardiansHint: {
    marginTop: '$spaceXS',
  },

  reduceGap: {
    gap: '$spaceS',
  },
});
