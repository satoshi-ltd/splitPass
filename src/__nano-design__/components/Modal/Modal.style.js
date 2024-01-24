import color from 'color';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  overflow: {
    backgroundColor: () => color(StyleSheet.value('$colorContent')).alpha(0.33).string(),
    flex: 1,
    justifyContent: 'flex-end',
  },

  safeAreaView: {
    backgroundColor: '$colorBase',
  },

  pressableClose: {
    alignItems: 'center',
    paddingTop: '$spaceS',
    paddingBottom: '$spaceXS',
    width: '100%',
  },

  content: {
    paddingHorizontal: '$spaceM',
    paddingBottom: '$spaceM',
  },
});
