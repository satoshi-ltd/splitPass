import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '$colorSurface',
    borderRadius: '$borderRadius',
    height: '$spaceXL',
    justifyContent: 'center',
    width: '$spaceXL',
  },
  actionButtonDisabled: {
    opacity: 0.35,
  },
});
