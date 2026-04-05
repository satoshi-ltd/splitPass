const DEFAULTS = {
  security: {
    configured: false,
    legacy: false,
    unlocked: false,
  },
  secrets: [],
  settings: {
    biometricUnlockEnabled: false,
    language: undefined,
    onboarded: false,
    reminders: [1],
    theme: 'light',
    websiteFaviconsEnabled: true,
  },
};

const FILENAME = 'com.satoshi-ltd.splitpass';

export { DEFAULTS, FILENAME };
