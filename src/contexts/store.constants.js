import { DEFAULT_THEME } from '../App.constants';

const DEFAULTS = {
  secrets: [],
  settings: {
    onboarded: false,
    reminders: [1],
    theme: DEFAULT_THEME,
  },
  subscription: {},
};

const FILENAME = 'com.satoshi-ltd.splitpass';

export { DEFAULTS, FILENAME };
