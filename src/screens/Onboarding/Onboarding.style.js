import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  slide: {
    alignItems: 'flex-start',
    flex: 1,
    gap: '$spaceL',
    justifyContent: 'flex-end',
    padding: '$spaceXL',
  },

  image: {
    marginBottom: '$spaceM',
  },

  footer: {
    alignItems: 'center',
    paddingBottom: '$spaceXL',
    paddingHorizontal: '$spaceXL',
    paddingTop: '$spaceM',
    justifyContent: 'space-between',
  },

  button: {
    width: '33%',
  },
});
