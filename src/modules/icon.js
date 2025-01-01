import { VAULT_TYPE } from '../App.constants';

export const ICON = {
  ADD: 'plus',

  BACK: 'chevron-left',
  BARCODE: 'barcode',

  DATABASE_ADD: 'database-plus-outline',
  DATABASE_REMOVE: 'database-remove-outline',

  FAVORITE: 'star',
  UNFAVORITE: 'star-outline',

  QRCODE: 'qrcode',

  SCAN: 'qrcode-scan',
  SEARCH: 'magnify',
  SETTINGS: 'cog-outline',

  WIFI: 'wifi',

  // VAULT_TYPE
  [VAULT_TYPE[0]]: 'web',
  [VAULT_TYPE[1]]: 'wallet-outline',
  [VAULT_TYPE[2]]: 'badge-account-horizontal-outline',
  [VAULT_TYPE[3]]: 'archive-outline',
};
