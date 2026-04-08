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
  headerSubtitle: {
    maxWidth: '90%',
  },
  content: {
    gap: '$spaceL',
    paddingTop: '$spaceM',
  },
  signInContent: {
    gap: '$spaceS',
  },
  formSection: {
    marginTop: '$spaceS',
  },
  signInFormSection: {
    marginTop: '$spaceXS',
  },
  warningCard: {
    backgroundColor: '$colorSurface',
    borderColor: '$colorBorder',
    borderRadius: '$borderRadius',
    borderWidth: '$borderWidth',
    marginBottom: '$spaceS',
    padding: '$spaceS',
  },
  form: {
    gap: '$spaceM',
  },
  setupForm: {
    gap: '$spaceS',
  },
  signInForm: {
    marginTop: '$spaceM',
  },
  signInFieldBox: {
    paddingVertical: 0,
  },
  biometricSecondaryButton: {
    marginTop: 0,
  },
  actions: {
    gap: '$spaceXS',
    marginTop: '$spaceL',
  },
  signInActions: {
    marginTop: '$spaceM',
  },
  button: {
    borderRadius: '$borderRadius',
    minHeight: '$spaceXL + $spaceS',
  },
  signInButton: {
    marginTop: 0,
  },
  setupButton: {
    marginTop: 0,
  },
  importButton: {
    marginTop: 0,
  },
  importCancelButton: {
    marginTop: 0,
  },
  setupHint: {
    marginTop: '$spaceXXS',
  },
  fieldBox: {
    gap: '$spaceXS',
    paddingVertical: '$spaceXXS',
  },
  fieldLabel: {
    color: '$colorContent',
  },
  inputField: {
    borderRadius: 0,
    fontSize: 16,
    paddingHorizontal: '$spaceS',
  },
  inputShell: {
    backgroundColor: '$colorSurface',
    borderRadius: 0,
    minHeight: '$spaceXL',
  },
});
