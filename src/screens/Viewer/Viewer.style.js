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
    backgroundColor: '$qrBackgroundColor',
    borderColor: '$qrColor',
    borderRadius: '$borderRadius',
    borderStyle: '$borderStyle',

    position: 'absolute',
    borderWidth: '$viewOffset / 2',
    color: '$qrColor',
    height: '$qrSize / 3',
    width: '$qrSize / 3',
    top: '$qrSize / 2',
    marginTop: '$viewOffset * -1.75',
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
