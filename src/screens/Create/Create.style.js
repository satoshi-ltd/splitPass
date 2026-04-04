import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },

  headerSafeArea: {
    backgroundColor: '$colorBase',
  },

  headerContainer: {
    backgroundColor: '$colorBase',
  },

  header: {
    gap: '$spaceXXS',
  },

  headerRow: {
    gap: '$spaceS',
  },

  headerText: {
    gap: '$spaceXXS',
  },

  headerSubtitle: {
    maxWidth: '90%',
  },

  content: {
    gap: '$spaceL',
    paddingTop: '$spaceS',
  },

  form: {
    gap: '$spaceM',
  },

  totpScannerCard: {
    backgroundColor: '$colorSurface',
    borderColor: '$colorBorder',
    borderWidth: 1,
    gap: '$spaceXS',
    padding: '$spaceM',
  },

  totpScannerMeta: {
    color: '$colorContent',
    opacity: 0.72,
  },

  fieldBox: {
    gap: '$spaceXS',
    paddingVertical: '$spaceXXS',
  },

  cardDetailsRow: {
    gap: '$spaceM',
  },

  cardDetailField: {
    flex: 1,
  },

  cardDetailFieldCompact: {
    flex: 0.62,
  },

  fieldLabel: {
    color: '$colorContent',
  },

  inputShell: {
    backgroundColor: '$colorSurface',
    borderRadius: 0,
    minHeight: '$spaceXL',
  },

  inputShellMultiline: {
    alignItems: 'flex-start',
    minHeight: '$spaceXXL * 2',
  },

  inputField: {
    borderRadius: 0,
    fontSize: 16,
    paddingHorizontal: '$spaceS',
  },

  inputFieldMultiline: {
    minHeight: '$spaceXXL * 2',
    paddingBottom: '$spaceS',
    paddingTop: '$spaceS',
    textAlignVertical: 'top',
  },

  inputActionButton: {
    alignItems: 'center',
    borderRadius: 0,
    backgroundColor: '$colorSurface',
    height: '$spaceXL',
    justifyContent: 'center',
    width: '$spaceXL',
  },

  inputActionButtonMultiline: {
    marginTop: '$spaceXS',
  },

  recoveryRow: {
    alignItems: 'center',
    gap: '$spaceS',
  },

  caption: {
    flex: 1,
  },

  actions: {
    gap: '$spaceXS',
    marginTop: '$spaceS',
  },

  button: {
    borderRadius: '$borderRadius',
    minHeight: '$spaceXL + $spaceS',
  },

  secondaryButton: {
    minHeight: '$spaceXL',
  },
});
