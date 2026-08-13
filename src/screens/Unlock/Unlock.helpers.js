export const getUnlockModeFlags = (mode = 'unlock', settings = {}) => {
  const isExport = mode === 'export';
  const isImport = mode === 'import';
  const isSignIn = mode === 'unlock';
  const isSetup = mode === 'setup';

  return {
    biometricEnabled: isSignIn && !!settings?.biometricUnlockEnabled,
    isExport,
    isImport,
    isSetup,
    isSignIn,
    showImportCancel: isImport || isExport,
  };
};

// Never widen to 'inactive': iOS reports it while the biometric sheet is open, which would loop the prompt.
export const isReturningToForeground = (previousState, nextState) =>
  previousState === 'background' && nextState === 'active';

export const canOfferBiometrics = ({ biometricAvailable, biometricEnabled = false } = {}) =>
  !!biometricEnabled && biometricAvailable !== false;

export const shouldAutoPromptBiometrics = ({
  availability,
  biometricEnabled = false,
  biometricInvalidated = false,
  mode = 'unlock',
} = {}) => !!biometricEnabled && !biometricInvalidated && mode === 'unlock' && !!availability?.available;

export const resolveUnlockFailure = ({ errorCode, failedAttempts = 0 } = {}) => {
  if (errorCode === 'ERR_PERSISTENCE_FORMAT') {
    return { type: 'storageReset' };
  }

  if (errorCode && errorCode !== 'ERR_PERSISTENCE_UNLOCK_FAILED') {
    return { type: 'genericError' };
  }

  const nextFailedAttempts = failedAttempts + 1;
  const remaining = Math.max(0, 3 - nextFailedAttempts);

  if (nextFailedAttempts >= 3) {
    return { nextFailedAttempts, remaining, type: 'wipeout' };
  }

  return { nextFailedAttempts, remaining, type: 'invalidPassphrase' };
};
