import { getUnlockModeFlags, resolveUnlockFailure } from '../Unlock.helpers';

describe('Unlock helpers', () => {
  describe('getUnlockModeFlags', () => {
    it('enables cancel button only in import mode', () => {
      expect(getUnlockModeFlags('import').showImportCancel).toBe(true);
      expect(getUnlockModeFlags('unlock').showImportCancel).toBe(false);
      expect(getUnlockModeFlags('setup').showImportCancel).toBe(false);
    });

    it('enables biometric unlock only for sign in mode', () => {
      const settings = { biometricUnlockEnabled: true };

      expect(getUnlockModeFlags('unlock', settings).biometricEnabled).toBe(true);
      expect(getUnlockModeFlags('import', settings).biometricEnabled).toBe(false);
      expect(getUnlockModeFlags('setup', settings).biometricEnabled).toBe(false);
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
