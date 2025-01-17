export const L10N = {
  ABOUT: 'About split|Pass',

  ANNUALY: 'Annualy',
  APPERANCE_DARK: 'Switch to dark mode',
  APPERANCE_LIGHT: 'Switch to light mode',

  BANNER_SUBSCRIPTION_CAPTION: 'Upgrade Now',
  BANNER_SUBSCRIPTION_DESCRIPTION: 'Discover advanced security options and enhanced control for your secrets.',
  BANNER_SUBSCRIPTION_TITLE: 'Unlock Premium Features in split|Pass',

  CANCEL_ANYTIME: 'Cancel anytime',
  CHOOSE_PLAN: 'Choose your plan',
  CLOSE: 'Close',
  CONFIRM_EXPORT_SUCCESS: 'Export successful! Your data has been saved.',
  CONFIRM_IMPORT: 'Confirm import',
  CONFIRM_IMPORT_CAPTION: ({ secrets = [] }) =>
    `Ready to import the JSON file? It'll update your vaults with ${secrets.length} secrets. Just make sure the file is good to go—this action can't be undone!"`,
  CONFIRM_IMPORT_SUCCESS: 'Imported successfully.',

  DELETE_SECRET: 'Delete Secret',
  DELETE_SECRET_CAPTION:
    'Deleting this secret is permanent and cannot be undone. You will lose access to this secret and its details. Are you sure you want to continue?',
  DELETE_SECRET_TITLE: 'Confirm Secret Deletion',

  ERROR: 'Something went wrong',
  ERROR_EXPORT: 'Unable to export as you don’t have sharing permissions.',
  ERROR_IMPORT: 'The file format is not supported. Please choose a compatible file type.',
  ERROR_NFC_NOT_SUPPORTED: 'NFC is not supported by this device.',
  ERROR_PURCHASE: 'Purchase failed',
  ERROR_RESTORE: 'Restore failed',

  EXPORT_DATA: 'Export Data',
  EXPORT_DATA_CAPTION: 'JSON archive',

  FAVORITE: 'Favorite',

  GENERAL: 'General',
  GET_PREMIUM: 'Get split|Pass Premium',
  GET_SPLITCARD: 'Get your own split|Card',

  IMPORT_DATA: 'Import Data',
  IMPORT_DATA_CAPTION: 'JSON archive',

  LIFETIME: 'Lifetime',
  LIFETIME_DESCRIPTION: "Pay once and don't worry ever",

  MONTH: 'month',

  NFC_ACCESS_ERROR: 'Error accessing your split|Card. Please try again.',
  NFC_CARD_IS_FULL: 'Your split|Card is full. No more secrets can be saved.',
  NFC_NOT_SUPPORTED: 'NFC is not supported on this device.',

  OFF: 'Off',
  ON: 'On',

  PREFERENCES: 'Preferences',
  PRIVACY: 'Privacy Policy',
  PURCHASE: 'Purchase',
  PURCHASE_RESTORED: 'Purchase restored.',

  REMINDER_BACKUP: 'Backup Reminder',
  REMINDER_BACKUP_CAPTION: 'Remember to save your secrets.',
  RESCAN: 'Rescan',
  RESTORE_PURCHASES: 'Restore purchases',
  REVEAL_SECRET: 'Reveal Secret',

  SAVE_IN_CARD: 'Save in Card',
  SAVE_IN_DEVICE: 'Save in Phone',
  SCAN_SECRET: 'Scan Secret',
  SCAN_SECRET_CAPTION: 'Scan to view a secret or become a guardian.',
  SCAN_SHARD: 'Scan Shard',
  SCANNER_NFC: 'Bring Your Card Close',
  SCANNER_NFC_CAPTION: 'Hold your split|Card near your phone to securely read the secret.',
  SCANNER_QR: 'Scan Your QR Code',
  SCANNER_QR_CAPTION: 'Align the QR code within the frame to securely read the secret.',
  SCANNING: 'Scanning...',
  SECRET_DELETED: 'Secret deleted successfully.',
  SET_PASSCODE: 'Set passcode',
  SETTINGS: 'Settings',
  SHARE: 'Share...',
  START_SCAN: 'Start Scan',
  START_TRIAL: 'Start free 7 day trial',
  SUBSCRIPTION: 'Subscription',
  SUBSCRIPTION_ACTUAL_PLAN: 'Actual plan',
  SUBSCRIPTION_AND: 'and',
  SUBSCRIPTION_CAPTION: 'No restrictions on shard pass, plus a robust import/export feature.',
  SUBSCRIPTION_CLOSE: 'No thanks',
  SUBSCRIPTION_DESCRIPTION:
    'Unlock premium features to take full control of your finances with an annual subscription.',
  SUBSCRIPTION_ITEMS: [
    {
      icon: 'currency-usd',
      title: 'Unlimited Multicurrency Accounts',
      description: 'Manage as many accounts in different currencies as you need, without any limits.',
    },
    {
      icon: 'swap-horizontal',
      title: 'Unlimited Transactions',
      description: 'Track and record all your financial activities without restrictions.',
    },
    {
      icon: 'palette',
      title: 'Enhanced Themes Customization',
      description: 'Create a unique visual experience by customizing themes for each currency.',
    },
    {
      icon: 'backup-restore',
      title: 'Import & Export Feature',
      description: 'Easily back up and transfer your financial data with the import and export functionality.',
    },
  ],
  SUBSCRIPTION_LIFETIME_DESCRIPTION:
    'Lifetime access to advanced financial tools and personalized insights with a one-time payment.',
  SUBSCRIPTION_NEXT_BILLING_DATE: 'Next billing date',
  SUBSCRIPTION_PRIVACY: 'Privacy Policy',
  SUBSCRIPTION_TERMS: 'Terms',
  SUBSCRIPTION_TERMS_CAPTION:
    'By tapping "Start free 7 day trial", you will not be charged for the next 7 days, your subscription will auto-renew for the same price and package length until you cancel via App Store Settings. and you agree to our',
  SUBSCRIPTION_TITLE: 'Maximize Your secrets',

  TERMS: 'Terms',

  VIEWER_CAPTION_ENTER_PASSCODE: 'To reveal the secret, please enter your passcode.',
  VIEWER_CAPTION_HOLD_TO_REVEAL: 'Hold to reveal the secret behind the QR.',
  VIEWER_CAPTION_SHARD_SCANNER: 'This is a shard. Scan to reveal the secret.',
};
