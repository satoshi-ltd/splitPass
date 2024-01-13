import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    width: Dimensions.get('window').width,
  },

  steps: {
    gap: '$spaceXS',
    marginHorizontal: '$spaceM',
    marginVertical: '$spaceS',
  },

  step: {
    backgroundColor: '$colorAccent',
    borderRadius: '$borderRadius',
    height: '$spaceXS',
  },

  stepDisabled: {
    backgroundColor: '$colorDisabled',
  },

  item: {
    gap: '$spaceM',
    marginTop: '$spaceXL',
    flex: 1,
  },

  title: {
    padding: '$spaceM',
  },

  buttons: {
    // backgroundColor: 'blue',
    gap: '$spaceL',
    justifyContent: 'flex-end',
    height: '$spaceXL * 8',
    paddingHorizontal: '$spaceXL',
    paddingVertical: '$spaceM',
  },
});
