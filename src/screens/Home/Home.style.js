import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  content: {
    paddingTop: '$spaceS',
    paddingBottom: '$spaceXXL * 3',
  },

  header: {
    gap: '$spaceS',
    paddingBottom: '$spaceXS',
  },

  headerText: {
    gap: '$spaceXXS',
  },

  headerSubtitle: {
    maxWidth: '96%',
  },

  searchInputShell: {
    backgroundColor: '$colorSurface',
    borderRadius: 0,
    minHeight: '$spaceXL',
    width: '100%',
  },

  searchInput: {
    borderRadius: 0,
    fontSize: 16,
    paddingHorizontal: '$spaceS',
    paddingVertical: 0,
  },

  searchClearButton: {
    alignItems: 'center',
    height: '$spaceL',
    justifyContent: 'center',
    width: '$spaceL',
  },

  section: {
    marginBottom: '$spaceS',
  },

  sectionLabel: {
    marginBottom: '$spaceXS',
    paddingLeft: '$spaceXXS',
  },
  menuOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 30,
  },
  menuBackdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  menuWrap: {
    position: 'absolute',
    right: '$spaceM',
    width: 210,
    zIndex: 31,
  },
});
