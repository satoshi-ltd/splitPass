import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL',
    paddingTop: '$spaceXXL',
    ...Platform.select({ web: { marginTop: '$viewOffset + $spaceXL' } }),
  },

  group: {
    marginBottom: '$viewOffset * 2',
  },

  setting: {
    // backgroundColor: 'yellow',
  },

  content: {
    borderColor: '$colorBorder',
    borderStyle: '$borderStyle',
    borderBottomWidth: '$borderWidth',
    flex: 1,
    paddingVertical: '$spaceM',
  },
});
