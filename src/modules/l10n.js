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
  CONTINUE: 'Continue',

  DELETE_SECRET: 'Delete Secret',
  DELETE_SECRET_CAPTION:
    'Deleting this secret is permanent. You will lose access to it and its details. Are you sure you want to proceed?',
  DELETE_SECRET_TITLE: 'Confirm Secret Deletion',

  ERROR: 'Something went wrong',
  ERROR_EXPORT: 'Unable to export as you don’t have sharing permissions.',
  ERROR_IMPORT: 'Unsupported file format. Please select a compatible file type.',
  ERROR_NFC_NOT_SUPPORTED: 'NFC is not supported by this device.',
  ERROR_PURCHASE: 'Purchase failed',
  ERROR_RESTORE: 'Restore failed',

  EXPORT_DATA: 'Export Data',
  EXPORT_DATA_CAPTION: 'JSON archive',

  FAVORITE: 'Favorite',
  FIRST_SECRET: 'First Secret',
  FIRST_SECRET_CAPTION: 'Create and store your first secret today.',
  FIRST_SHARD_SCANNED: 'First shard scanned! Scan the second shard to unlock your secret.',
  FIRST_SHARD_SAME: 'The second shard is identical to the first. Please scan a different shard.',

  GENERAL: 'General',
  GET_PREMIUM: 'Get split|Pass Premium',
  GET_SPLITCARD: 'Get your own split|Card',

  IMPORT_DATA: 'Import Data',
  IMPORT_DATA_CAPTION: 'JSON archive',

  LIFETIME: 'Lifetime',
  LIFETIME_DESCRIPTION: "Pay once and don't worry ever",

  MONTH: 'month',

  NAME: 'Name',
  NAME_PLACEHOLDER: 'Name...',
  NEW_SECRET: 'New Secret',
  NEXT: 'Next',
  NFC_ACCESS_ERROR: 'Error accessing your split|Card. Please try again.',
  NFC_CARD_IS_FULL: 'Your split|Card is full. No more secrets can be saved.',
  NFC_NOT_SUPPORTED: 'NFC is not supported on this device.',

  OFF: 'Off',
  ON: 'On',

  PASSCODE: '6-digit passcode',
  PASSCODE_PLACEHOLDER: 'passcode...',
  PREFERENCES: 'Preferences',
  PRIVACY: 'Privacy Policy',
  PURCHASE: 'Purchase',
  PURCHASE_RESTORED: 'Purchase restored.',

  QR_CODE: 'QR Code',
  NFC_CARD: 'NFC Card',

  REMINDER_BACKUP: 'Backup Reminder',
  REMINDER_BACKUP_CAPTION: 'Remember to save your secrets.',
  RESCAN: 'Rescan',
  RESTART: 'Restart',
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
  SEARCH: 'Search...',
  SECRET: 'Secret',
  SECRET_PLACEHOLDER: 'Secret...',
  SECRET_DELETED: 'Secret deleted successfully.',
  SECRET_SAVED_IN_NFC: 'The secret has been successfully saved to your split|Card.',
  SET_PASSCODE: 'Set passcode',
  SETTINGS: 'Settings',
  SHARE: 'Share...',
  SHARD_EXPLANATION: 'Recover this secret will require the approval of at least ',
  SHARD_EXPLANATION_NUMBER: '2 out of 3',
  SHARD_EXPLANATION_GUARDIANS: ' guardians',
  START: 'Start',
  START_SCAN: 'Start Scan',
  START_TRIAL: 'Start free 7 day trial',
  SUBSCRIPTION: 'Subscription',
  SUBSCRIPTION_ACTUAL_PLAN: 'Actual plan',
  SUBSCRIPTION_AND: 'and',
  SUBSCRIPTION_DESCRIPTION: 'Unlock premium features to take full control of your secrets with an annual subscription.',
  SUBSCRIPTION_ITEMS: [
    {
      icon: 'infinity',
      title: 'Unlimited Shards',
      description: 'Create as many shared secrets as you need, with no restrictions or limits.',
    },
    {
      icon: 'nfc',
      title: 'Use Your Own NFC Cards',
      description: 'Unlock the ability to use your personal NFC cards instead of split|Card.',
    },
    {
      icon: 'backup-restore',
      title: 'Import & Export Capabilities',
      description: 'Easily back up and transfer your secrets using the import and export functionality.',
    },
  ],
  SUBSCRIPTION_LIFETIME_DESCRIPTION: 'Lifetime access to advanced secret management features with a one-time payment.',
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
