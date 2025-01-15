import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  card: {
    borderRadius: 12,
    height: 208,
    paddingHorizontal: '$spaceL',
    paddingVertical: '$spaceL - $spaceXS',
    width: 328,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 8,
  },

  row: {
    height: '$spaceL',
  },

  logo: {
    alignSelf: 'flex-end',
  },

  icon: {
    fontSize: '$spaceXXL',
    height: '$spaceXXL',
    lineHeight: '$spaceXXL',
    marginLeft: '$spaceXXS * -1',
    opacity: 0.66,
    width: '$spaceXXL',
  },

  embossedText: {
    letterSpacing: 1,
  },
});
