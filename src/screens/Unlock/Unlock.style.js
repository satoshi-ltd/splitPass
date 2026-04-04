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
    paddingTop: '$spaceS',
  },
  signInContent: {
    gap: '$spaceS',
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
    marginTop: '$spaceS',
  },
  button: {
    borderRadius: '$borderRadius',
    marginTop: '$spaceM',
    minHeight: '$spaceXL + $spaceS',
  },
  signInButton: {
    marginTop: 0,
  },
  setupButton: {
    marginTop: '$spaceS',
  },
  importButton: {
    marginTop: '$spaceXS',
  },
  caption: {
    flex: 1,
  },
  setupCaption: {
    flex: 0,
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
