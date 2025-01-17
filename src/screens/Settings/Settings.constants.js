import { SATOSHI_URLS } from '../../App.constants';
import { ICON, L10N } from '../../modules';

const OPTIONS = (isPremium, subscription) => [
  {
    callback: !isPremium ? 'handleSubscription' : undefined,
    caption: isPremium
      ? `${L10N.SUBSCRIPTION_ACTUAL_PLAN}: ${subscription?.customerInfo?.entitlements?.active?.['pro']?.identifier}`
      : undefined,
    icon: ICON.FAVORITE,
    id: 1,
    text: L10N.SUBSCRIPTION,
  },
  {
    disabled: true,
    // callback: 'handleSubscription',
    // caption: '$$No active subscription',
    icon: ICON.SHOPPING,
    id: 2,
    text: L10N.GET_SPLITCARD,
  },
  {
    callback: 'handleExport',
    caption: L10N.EXPORT_DATA_CAPTION,
    icon: ICON.DOWNLOAD,
    id: 3,
    text: L10N.EXPORT_DATA,
  },
  {
    callback: 'handleImport',
    caption: L10N.IMPORT_DATA_CAPTION,
    icon: ICON.UPLOAD,
    id: 4,
    text: L10N.IMPORT_DATA,
  },
];

const REMINDER_BACKUP_OPTIONS = [
  { text: L10N.OFF, value: 0 },
  { text: L10N.ON, value: 1 },
];

const ABOUT = (isPremium) => [
  ...(!isPremium ? [{ callback: 'handleSubscription', icon: ICON.STAR, text: L10N.GET_PREMIUM }] : []),
  ...(!isPremium ? [{ callback: 'handleRestorePurchases', icon: ICON.CART, text: L10N.RESTORE_PURCHASES }] : []),
  { icon: ICON.FILE, url: SATOSHI_URLS.TERMS, text: L10N.TERMS },
  { icon: ICON.FILE, url: SATOSHI_URLS.PRIVACY, text: L10N.PRIVACY },
];

export { ABOUT, OPTIONS, REMINDER_BACKUP_OPTIONS };
