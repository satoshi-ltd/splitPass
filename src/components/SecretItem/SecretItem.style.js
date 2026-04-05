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
    position: 'relative',
  },
  thumbnailImage: {
    borderRadius: '$spaceXXS',
    height: '$spaceM + $spaceXXS',
    width: '$spaceM + $spaceXXS',
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

  shardBadgeText: {
    bottom: 3,
    includeFontPadding: false,
    lineHeight: 11,
    opacity: 0.58,
    position: 'absolute',
    right: 3,
    textAlign: 'right',
  },

  shardBadgeTextFavorite: {
    opacity: 0.72,
  },

  action: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '$spaceM',
  },
});
