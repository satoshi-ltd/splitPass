const DEFAULTS = {
  security: {
    configured: false,
    legacy: false,
    unlocked: false,
  },
  secrets: [],
  settings: {
    autoLockSeconds: 30,
    biometricUnlockEnabled: false,
    externalSharingEnabled: false,
    language: undefined,
    onboarded: false,
    reminders: [1],
    theme: 'light',
    websiteFaviconsEnabled: false,
  },
};

const FILENAME = 'com.satoshi-ltd.splitpass';

export { DEFAULTS, FILENAME };
