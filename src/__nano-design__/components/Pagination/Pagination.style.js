import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  pagination: {
    gap: '$spaceXS',
    justifyContent: 'center',
  },

  dot: {
    backgroundColor: '$paginationColor',
    borderRadius: '$paginationSize / 2',
    height: '$paginationSize',
    maxWidth: '$paginationSize',
    width: '$paginationSize',
  },

  dotActive: {
    backgroundColor: '$paginationColorActive',
    maxWidth: '$paginationSize * 2',
    width: '$paginationSize * 2',
  },
});
