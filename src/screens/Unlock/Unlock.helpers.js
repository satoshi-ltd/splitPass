export const getUnlockModeFlags = (mode = 'unlock', settings = {}) => {
  const isImport = mode === 'import';
  const isSignIn = mode === 'unlock';
  const isSetup = mode === 'setup';

  return {
    biometricEnabled: isSignIn && !!settings?.biometricUnlockEnabled,
    isImport,
    isSetup,
    isSignIn,
    showImportCancel: isImport,
  };
};

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
