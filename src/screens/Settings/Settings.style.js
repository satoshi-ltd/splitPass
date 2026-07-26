import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  header: {
    gap: '$spaceXXS',
  },

  headerSubtitle: {
    maxWidth: '90%',
  },

  content: {
    gap: '$spaceS',
    paddingTop: '$spaceS',
  },

  group: {
    gap: 0,
  },

  groupTitle: {
    color: '$colorContentLight',
    letterSpacing: 1,
    marginBottom: '$spaceXS',
    textTransform: 'uppercase',
  },

  hint: {
    marginTop: '$spaceXS',
  },

  offset: {
    marginHorizontal: '$spaceM',
    width: 'auto',
  },
});
