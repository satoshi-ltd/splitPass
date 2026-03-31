import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    backgroundColor: '$colorBase',
  },

  header: {
    alignItems: 'center',
    minHeight: '$spaceL',
  },

  headerAction: {
    alignItems: 'center',
    height: '$spaceL',
    justifyContent: 'center',
    width: '$spaceL',
  },

  headerStatus: {
    gap: '$spaceXS',
    marginLeft: 'auto',
  },

  content: {
    flexGrow: 1,
    paddingBottom: '$spaceL',
  },

  hero: {
    marginBottom: '$spaceXL',
    marginTop: '$spaceM',
  },

  subtitle: {
    marginTop: '$spaceXXS',
    maxWidth: '90%',
  },

  controlGroup: {
    marginBottom: '$spaceXL',
  },

  sliderRow: {
    gap: '$spaceL',
    marginTop: '$spaceS',
  },

  slider: {
    flex: 1,
    height: 40,
  },

  counterGroup: {
    marginBottom: '$spaceL',
  },

  counterRow: {
    marginTop: '$spaceS',
  },

  counterActions: {
    gap: '$spaceS',
  },

  counterButton: {
    borderRadius: '$borderRadius',
  },

  metricValue: {
    fontSize: 44,
    lineHeight: 48,
  },

  footer: {
    paddingHorizontal: '$viewOffset',
    paddingTop: '$spaceM',
  },

  footerDark: {
    backgroundColor: '$colorDark',
  },

  footerLight: {
    backgroundColor: '$qrBackgroundColor',
  },

  footerRow: {
    gap: '$spaceM',
    minHeight: '$spaceXXL + $spaceM',
  },

  passwordWrap: {
    flex: 1,
    flexWrap: 'wrap',
    gap: 0,
  },

  footerActions: {
    gap: '$spaceS',
    marginLeft: '$spaceM',
  },
});
