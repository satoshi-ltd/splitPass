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
    paddingHorizontal: '$spaceM',
  },

  header: {
    alignItems: 'center',
    gap: '$spaceXS',
    minHeight: '$spaceXL',
    paddingBottom: '$spaceXS',
    position: 'relative',
  },

  headerAction: {
    alignItems: 'center',
    height: '$spaceL',
    justifyContent: 'center',
    width: '$spaceL',
  },

  headerText: {
    flex: 1,
    gap: '$spaceXXS',
  },

  subtitlePressable: {
    alignSelf: 'stretch',
  },

  subtitle: {
    color: '$colorContent',
    maxWidth: '95%',
    opacity: 1,
  },

  caption: {
    color: '$colorContentLight',
    maxWidth: '95%',
    opacity: 1,
  },

  riskNotice: {
    alignItems: 'flex-start',
  },

  riskNoticeText: {
    flex: 1,
    includeFontPadding: false,
  },

  menuWrap: {
    position: 'absolute',
    right: 0,
    top: '$spaceL',
    zIndex: 20,
  },

  menuBackdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: '$spaceM',
    paddingHorizontal: 0,
    paddingTop: '$spaceS',
  },

  qrSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  scrollView: {
    width: '100%',
  },

  qrSlide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '$viewOffset',
  },

  qrShell: {
    borderRadius: '$borderRadius',
  },

  lockedQrShell: {
    backgroundColor: '$qrBackgroundColor',
    borderRadius: '$borderRadius',
    padding: 0,
    position: 'relative',
  },

  lockedQrShellDark: {
    backgroundColor: '$colorSurface',
  },

  lockedQrPreview: {
    opacity: 0.22,
  },

  lockedQrPreviewDark: {
    opacity: 1,
  },

  lockedQrOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  lockedQrIconWrap: {
    alignItems: 'center',
    backgroundColor: '$qrBackgroundColor',
    height: '$spaceXXL',
    justifyContent: 'center',
    opacity: 0.82,
    width: '$spaceXXL',
  },

  lockedQrIconWrapDark: {
    backgroundColor: '$colorSurface',
    opacity: 0.92,
  },

  shardBadge: {
    marginTop: '$spaceS',
  },

  pagination: {
    marginTop: '$spaceM',
  },

  footer: {
    flexShrink: 0,
    zIndex: 2,
  },

  footerDark: {
    backgroundColor: '$colorDark',
  },

  footerLight: {
    backgroundColor: '$qrBackgroundColor',
  },

  footerSafeArea: {
    flexShrink: 0,
  },

  footerInner: {
    paddingBottom: '$spaceXS',
    paddingHorizontal: '$viewOffset',
    paddingTop: '$spaceM',
  },
});
