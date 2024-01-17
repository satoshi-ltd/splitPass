import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    backgroundColor: '$colorBase',
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  readMode: {
    backgroundColor: '$colorContent',
    borderRadius: '$borderRadius * 2',
    height: 'auto',
  },

  breadcrumbs: {
    gap: '$spaceXS',
    marginHorizontal: '$spaceXL',
    marginVertical: '$spaceS',
  },

  breadcrumb: {
    backgroundColor: '$colorAccent',
    borderRadius: '$borderRadius',
    height: '$spaceXS',
  },

  disabled: {
    backgroundColor: '$colorDisabled',
  },

  item: {
    alignSelf: 'flex-end',
    flex: 1,
    gap: '$spaceS',
    justifyContent: 'flex-end',
    paddingTop: '$spaceL',
  },

  title: {
    padding: '$spaceM',
  },

  footer: {
    gap: '$spaceS',
    justifyContent: 'flex-end',
    paddingBottom: '$spaceS',
    paddingHorizontal: '$spaceXL',
  },

  footerFixed: {
    height: '$spaceXL * 9',
  },
});
