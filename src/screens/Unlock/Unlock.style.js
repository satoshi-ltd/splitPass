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
  form: {
    gap: '$spaceM',
  },
  biometricButton: {
    marginBottom: '$spaceXS',
  },
  button: {
    borderRadius: '$borderRadius',
    marginTop: '$spaceM',
    minHeight: '$spaceXL + $spaceS',
  },
  caption: {
    flex: 1,
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
