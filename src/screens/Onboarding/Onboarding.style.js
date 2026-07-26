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
    gap: '$viewOffset / 2',
    justifyContent: 'flex-end',
    padding: '$spaceXL',
  },

  image: {
    marginBottom: '$spaceM',
  },
  title: {
    maxWidth: '90%',
  },
  subtitle: {
    maxWidth: '90%',
  },
  detail: {
    maxWidth: '90%',
    opacity: 0.7,
  },

  footer: {
    alignItems: 'center',
    paddingBottom: '$spaceXL',
    paddingHorizontal: '$spaceXL',
    paddingTop: '$spaceM',
    justifyContent: 'space-between',
  },

  button: {
    width: '38%',
  },
});
