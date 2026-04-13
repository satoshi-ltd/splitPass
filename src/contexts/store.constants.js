const DEFAULTS = {
  security: {
    configured: false,
    legacy: false,
    unlocked: false,
  },
  secrets: [],
  settings: {
    autoLockImmediatelyEnabled: false,
    autoLockSeconds: 30,
    biometricUnlockEnabled: false,
    clipboardAutoClearEnabled: true,
    externalSharingEnabled: false,
    language: undefined,
    onboarded: false,
    reminders: [1],
    theme: 'system',
    websiteFaviconsEnabled: false,
  },
};

const FILENAME = 'com.satoshi-ltd.splitpass';

export { DEFAULTS, FILENAME };
