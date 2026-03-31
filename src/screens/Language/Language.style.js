import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    backgroundColor: '$colorBase',
  },

  headerSafeArea: {
    backgroundColor: '$colorBase',
  },

  headerContainer: {
    backgroundColor: '$colorBase',
    paddingBottom: '$spaceM',
  },

  header: {
    alignItems: 'center',
    gap: '$spaceS',
    minHeight: '$spaceXL',
    paddingBottom: '$spaceXS',
  },

  headerText: {
    flex: 1,
    gap: '$spaceXXS',
  },

  content: {
    paddingBottom: '$spaceXXL * 3',
  },

  list: {
    gap: '$spaceXS',
  },

  item: {
    alignItems: 'center',
    gap: '$spaceS',
    paddingVertical: '$spaceXS',
  },

  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: '$spaceS',
  },

  rightPlaceholder: {
    width: '$spaceL',
  },
});
