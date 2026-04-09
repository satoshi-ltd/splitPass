import { SATOSHI_URLS } from '../../App.constants';
import { ICON, L10N } from '../../modules';

const SECURITY_OPTIONS = () => [
  {
    callback: 'handleExport',
    icon: ICON.DOWNLOAD,
    id: 1,
    text: L10N.EXPORT,
  },
  {
    callback: 'handleImport',
    icon: ICON.UPLOAD,
    id: 2,
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

const ABOUT_OPTIONS = () => [
  { icon: ICON.SHOPPING, text: L10N.GET_SPLITCARD, screen: 'marketplace' },
  { icon: ICON.FILE, url: SATOSHI_URLS.TERMS, text: L10N.TERMS },
  { icon: ICON.FILE, url: SATOSHI_URLS.PRIVACY, text: L10N.PRIVACY },
];

const ACCOUNT_DATA_OPTIONS = () => [
  { callback: 'handleLogout', icon: ICON.LOGOUT, text: L10N.LOGOUT },
  {
    callback: 'handleResetData',
    icon: ICON.RESET,
    text: L10N.RESET_DATA,
    tone: 'danger',
  },
];

export { ABOUT_OPTIONS, ACCOUNT_DATA_OPTIONS, DEVELOPMENT_OPTIONS, SECURITY_OPTIONS };
