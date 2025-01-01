import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    width: `${Dimensions.get('window').width / 2} - $spaceL`,
  },

  content: {
    height: '$spaceXXL * 2.5',
  },
});
