import { Platform } from 'react-native';
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.33,
    shadowRadius: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '$borderRadius',
    gap: '$spaceXXS',
    paddingLeft: '$spaceXS',
    paddingRight: '$spaceS',
    paddingVertical: '$spaceXXS',
  },

  action: {
    marginTop: '$viewOffset / 2',
  },

  records: {
    ...Platform.select({ web: { maxHeight: '$splitCardHeight' } }),
    flex: 1,
    overflow: 'hidden',
    paddingVertical: '$viewOffset / 4',
    width: '$splitCardWidth',
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
    shadowOpacity: 0.8,
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
