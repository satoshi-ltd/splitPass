import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
  },

  header: {
    width: '80%',
    marginBottom: '$viewOffset',
  },

  card: {
    borderRadius: 12,
    height: '$splitCardHeight',
    justifyContent: 'space-between',
    paddingHorizontal: '$spaceL',
    paddingVertical: '$spaceL - $spaceXS',
    width: '$splitCardWidth',
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
    opacity: 0.66,
  },

  cardMemory: {
    backgroundColor: '$qrBackgroundColor',
    borderRadius: '$borderRadius',
    gap: '$spaceXXS',
    paddingLeft: '$spaceXS',
    paddingRight: '$spaceS',
    paddingVertical: '$spaceXXS',
  },

  action: {
    minHeight: '$spaceS',
    marginTop: '$spaceXXS',
  },

  records: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: '$spaceXS',
    width: '$splitCardWidth',
  },

  record: {
    alignItems: 'center',
    borderRadius: '$borderRadius',
    flexDirection: 'row',
    gap: '$spaceS',
    marginVertical: '$spaceXXS',
    minHeight: '$spaceXXL',
  },

  recordThumb: {
    alignItems: 'center',
    backgroundColor: '$colorSurface',
    height: '$spaceXXL',
    justifyContent: 'center',
    width: '$spaceXXL',
  },

  recordBody: {
    flex: 1,
  },

  recordDelete: {
    marginLeft: '$spaceM',
    minWidth: '$spaceL',
  },
});
