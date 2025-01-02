import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  modan: {
    paddingTop: '$spaceXXL',
    backgroundColor: 'blue',
  },

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
    marginVertical: '$viewOffset / 2',
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

  index: {},

  cardOptions: {
    gap: '$viewOffset / 2',
    marginTop: '$viewOffset',
    paddingHorizontal: '$viewOffset / 2',
  },
});
