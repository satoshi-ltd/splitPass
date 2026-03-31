import { SATOSHI_URLS } from '../../App.constants';
import { ICON, L10N } from '../../modules';

const GENERAL_OPTIONS = () => [
  {
    icon: ICON.SHOPPING,
    id: 1,
    text: L10N.GET_SPLITCARD,
    screen: 'marketplace',
  },
  {
    callback: 'handleExport',
    icon: ICON.DOWNLOAD,
    id: 2,
    text: L10N.EXPORT,
  },
  {
    callback: 'handleImport',
    icon: ICON.UPLOAD,
    id: 3,
    text: L10N.IMPORT,
  },
];

const DEVELOPMENT_OPTIONS = () => [
  {
    callback: 'handleLoadDemoSecrets',
    icon: ICON.DATABASE_ADD,
    id: 1,
    text: L10N.LOAD_DEMO_SECRETS,
  },
];

const REMINDER_BACKUP_OPTIONS = [
  { text: L10N.OFF, value: 0 },
  { text: L10N.ON, value: 1 },
];

const ABOUT_OPTIONS = () => [
  { icon: ICON.FILE, url: SATOSHI_URLS.TERMS, text: L10N.TERMS },
  { icon: ICON.FILE, url: SATOSHI_URLS.PRIVACY, text: L10N.PRIVACY },
];

const ACCOUNT_DATA_OPTIONS = () => [
  { callback: 'handleLogout', icon: ICON.LOGOUT, text: L10N.LOGOUT },
  { callback: 'handleResetData', icon: ICON.RESET, text: L10N.RESET_DATA, tone: 'danger' },
];

export { ABOUT_OPTIONS, ACCOUNT_DATA_OPTIONS, DEVELOPMENT_OPTIONS, GENERAL_OPTIONS, REMINDER_BACKUP_OPTIONS };
