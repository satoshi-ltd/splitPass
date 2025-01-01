import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  item: {
    gap: '$viewOffset / 2',
    paddingVertical: '$viewOffset / 2',
  },

  thumbnail: {
    backgroundColor: '$colorBorder',
    borderRadius: '$spaceXXL / 2',
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
    maxWidth: '75%',
  },
});
