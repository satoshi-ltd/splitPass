import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  item: {
    alignItems: 'center',
    gap: '$spaceS',
    minHeight: '$spaceXXL + $spaceS',
    paddingVertical: '$spaceXXS',
  },

  body: {
    gap: '$spaceXXS',
  },

  thumbnail: {
    backgroundColor: '$colorSurface',
    borderRadius: 0,
    height: '$spaceXXL',
    width: '$spaceXXL',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },

  favorite: {
    backgroundColor: '$colorAccent',
  },

  name: {
    maxWidth: '100%',
  },

  subtitle: {
    maxWidth: '100%',
  },

  action: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '$spaceM',
  },
});
