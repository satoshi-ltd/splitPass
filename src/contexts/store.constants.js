import { DEFAULT_THEME } from '../App.constants';

const DEFAULTS = {
  secrets: [],
  settings: {
    onboarded: false,
    pin: undefined,
    reminders: [1, 1, 0, 1],
    syncedAt: undefined,
    subscription: {},
    theme: DEFAULT_THEME,
  },
};

const FILENAME = 'com.satoshi-ltd.secretqr';

export { DEFAULTS, FILENAME };
