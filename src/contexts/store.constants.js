import { DEFAULT_THEME } from '../App.constants';

const DEFAULTS = {
  secrets: [],
  settings: {
    onboarded: false,
    reminders: [1],
    subscription: {},
    theme: DEFAULT_THEME,
  },
};

const FILENAME = 'com.satoshi-ltd.splitpass';

export { DEFAULTS, FILENAME };
