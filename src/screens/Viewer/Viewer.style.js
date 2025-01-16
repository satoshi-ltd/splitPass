import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollView: {
    marginLeft: '$viewOffset * -1',
    marginRight: '$viewOffset * -1',
  },

  item: {
    alignSelf: 'flex-end',
    flex: 1,
    justifyContent: 'flex-end',
  },

  name: {
    marginTop: '$viewOffset',
  },

  caption: {
    gap: '$viewOffset / 4',
  },

  shard: {
    position: 'absolute',
    backgroundColor: '$qrBackgroundColor',
    borderColor: '$qrColor',
    borderRadius: '$borderRadius',
    borderStyle: '$borderStyle',
    borderWidth: '$viewOffset / 2',
    color: '$qrColor',
    fontSize: '$viewOffset * 2.25',
    height: '$viewOffset * 4.5',
    lineHeight: '$viewOffset * 3.5',
    top: '$spaceXXL * 1.8',
    width: '$viewOffset * 4.5',
  },

  buttonScanner: {
    alignSelf: 'center',
    marginBottom: '$viewOffset / 2',
    width: '$qrSize',
  },

  index: {},

  cardOptions: {
    gap: '$viewOffset / 2',
    marginTop: '$viewOffset',
  },
});
