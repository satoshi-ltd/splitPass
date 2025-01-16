import StyleSheet from 'react-native-extended-stylesheet';

const CARD_DIMENSION = {
  height: 208,
  width: 328,
};

export const style = StyleSheet.create({
  header: {
    width: '80%',
    marginBottom: '$viewOffset',
  },

  card: {
    ...CARD_DIMENSION,
    borderRadius: 12,
    paddingHorizontal: '$spaceL',
    paddingVertical: '$spaceL - $spaceXS',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  cardRow: {
    height: '$spaceL',
  },

  cardIcon: {
    fontSize: '$spaceXXL',
    height: '$spaceXXL',
    lineHeight: '$spaceXXL',
    marginLeft: '$spaceXXS * -1',
    opacity: 0.66,
    width: '$spaceXXL',
  },

  cardEmbossedText: {
    letterSpacing: 1,
  },

  records: {
    height: CARD_DIMENSION.height,
    width: CARD_DIMENSION.width,
    overflow: 'hidden',
    paddingVertical: '$viewOffset / 4',
  },

  record: {
    marginVertical: '$viewOffset / 4',
  },

  recordName: {
    marginHorizontal: '$viewOffset / 2',
    flex: 1,
  },

  gradient: {
    backgroundColor: '$colorBase',
    height: '$viewOffset / 2',
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: '$colorBase',
    shadowOpacity: 0.66,
    shadowRadius: 4,
    zIndex: 1,
  },

  gradientBottom: {
    bottom: '$viewOffset * -0.5',
    shadowOffset: { width: 0, height: -6 },
  },

  gradientTop: {
    shadowOffset: { width: 0, height: 6 },
    top: '$viewOffset * -0.5',
  },
});
