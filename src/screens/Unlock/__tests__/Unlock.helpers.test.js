import {
  getUnlockModeFlags,
  isReturningToForeground,
  resolveUnlockFailure,
  shouldAutoPromptBiometrics,
} from '../Unlock.helpers';

describe('Unlock helpers', () => {
  describe('getUnlockModeFlags', () => {
    it('enables cancel button in import and export modes', () => {
      expect(getUnlockModeFlags('import').showImportCancel).toBe(true);
      expect(getUnlockModeFlags('export').showImportCancel).toBe(true);
      expect(getUnlockModeFlags('unlock').showImportCancel).toBe(false);
      expect(getUnlockModeFlags('setup').showImportCancel).toBe(false);
    });

    it('flags export mode', () => {
      expect(getUnlockModeFlags('export').isExport).toBe(true);
      expect(getUnlockModeFlags('import').isExport).toBe(false);
      expect(getUnlockModeFlags('unlock').isExport).toBe(false);
    });

    it('enables biometric unlock only for sign in mode', () => {
      const settings = { biometricUnlockEnabled: true };

      expect(getUnlockModeFlags('unlock', settings).biometricEnabled).toBe(true);
      expect(getUnlockModeFlags('import', settings).biometricEnabled).toBe(false);
      expect(getUnlockModeFlags('setup', settings).biometricEnabled).toBe(false);
    });
  });

  describe('isReturningToForeground', () => {
    it('detects a return from background', () => {
      expect(isReturningToForeground('background', 'active')).toBe(true);
    });

    it('ignores the inactive state raised by the system biometric sheet', () => {
      expect(isReturningToForeground('inactive', 'active')).toBe(false);
      expect(isReturningToForeground('active', 'inactive')).toBe(false);
    });

    it('ignores transitions that do not end in the foreground', () => {
      expect(isReturningToForeground('background', 'inactive')).toBe(false);
      expect(isReturningToForeground('active', 'background')).toBe(false);
      expect(isReturningToForeground(undefined, 'active')).toBe(false);
    });
  });

  describe('shouldAutoPromptBiometrics', () => {
    const available = { available: true };

    it('prompts on sign in when biometrics are enabled and available', () => {
      expect(shouldAutoPromptBiometrics({ availability: available, biometricEnabled: true, mode: 'unlock' })).toBe(
        true,
      );
    });

    it('does not prompt when biometric unlock is disabled', () => {
      expect(shouldAutoPromptBiometrics({ availability: available, biometricEnabled: false, mode: 'unlock' })).toBe(
        false,
      );
    });

    it('does not prompt when the device has no usable biometrics', () => {
      expect(shouldAutoPromptBiometrics({ availability: { available: false }, biometricEnabled: true })).toBe(false);
      expect(shouldAutoPromptBiometrics({ availability: undefined, biometricEnabled: true })).toBe(false);
    });

    it('does not prompt outside sign in mode', () => {
      ['export', 'import', 'setup'].forEach((mode) => {
        expect(shouldAutoPromptBiometrics({ availability: available, biometricEnabled: true, mode })).toBe(false);
      });
    });

    it('does not prompt once the stored biometric credential is invalidated', () => {
      expect(
        shouldAutoPromptBiometrics({ availability: available, biometricEnabled: true, biometricInvalidated: true }),
      ).toBe(false);
    });

    it('does not prompt without arguments', () => {
      expect(shouldAutoPromptBiometrics()).toBe(false);
    });
  });

  describe('resolveUnlockFailure', () => {
    it('resolves storage format errors as storage reset', () => {
      expect(resolveUnlockFailure({ errorCode: 'ERR_PERSISTENCE_FORMAT', failedAttempts: 0 })).toEqual({
        type: 'storageReset',
      });
    });

    it('resolves unknown coded errors as generic', () => {
      expect(resolveUnlockFailure({ errorCode: 'ERR_UNKNOWN', failedAttempts: 0 })).toEqual({ type: 'genericError' });
    });

    it('resolves failed unlock attempts to wipeout on third try', () => {
      expect(resolveUnlockFailure({ errorCode: 'ERR_PERSISTENCE_UNLOCK_FAILED', failedAttempts: 2 })).toEqual({
        nextFailedAttempts: 3,
        remaining: 0,
        type: 'wipeout',
      });
    });

    it('resolves failed unlock attempts with remaining tries before wipeout', () => {
      expect(resolveUnlockFailure({ errorCode: 'ERR_PERSISTENCE_UNLOCK_FAILED', failedAttempts: 1 })).toEqual({
        nextFailedAttempts: 2,
        remaining: 1,
        type: 'invalidPassphrase',
      });
    });
  });
});
