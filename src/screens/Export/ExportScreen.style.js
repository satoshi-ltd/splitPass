import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollView: {
    marginLeft: '$viewOffset * -1',
    marginRight: '$viewOffset * -1',
  },

  item: {
    alignSelf: 'flex-end',
    flex: 1,
    gap: '$spaceS',
    justifyContent: 'flex-end',
    paddingTop: '$spaceL',
  },

  title: {
    marginRight: '$spaceXS',
  },

  footer: {
    gap: '$spaceM',
    justifyContent: 'flex-end',
  },

  footerMaximize: {
    height: '$spaceXL * 8',
  },
});
