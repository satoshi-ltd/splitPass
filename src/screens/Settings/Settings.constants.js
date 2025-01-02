import { SATOSHI_URLS } from '../../App.constants';
import { ICON, L10N } from '../../modules';

const OPTIONS = [
  // {
  //   callback: 'handleSubscription',
  //   // caption: '$$No active subscription',
  //   icon: ICON.FAVORITE,
  //   id: 1,
  //   text: L10N.SUBSCRIPTION,
  // },
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

const PREFERENCES = [
  {
    disabled: true,
    icon: ICON.BELL,
    screen: 'reminders',
    text: L10N.REMINDERS,
  },
];

const ABOUT = (isPremium) => [
  // ...(!isPremium
  //   ? [
  //       {
  //         callback: 'handleSubscription',
  //         icon: ICON.STAR,
  //         text: L10N.GET_MONEY_PREMIUM,
  //       },
  //     ]
  //   : []),
  // ...(!isPremium
  //   ? [
  //       {
  //         callback: 'handleRestorePurchases',
  //         icon: ICON.CART,
  //         text: L10N.RESTORE_PURCHASES,
  //       },
  //     ]
  //   : []),
  {
    icon: ICON.FILE,
    url: SATOSHI_URLS.TERMS,
    text: L10N.TERMS,
  },
  {
    icon: ICON.FILE,
    url: SATOSHI_URLS.PRIVACY,
    text: L10N.PRIVACY,
  },
];

export { ABOUT, OPTIONS, PREFERENCES };
