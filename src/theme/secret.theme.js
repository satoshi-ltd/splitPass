import { Dimensions } from 'react-native';

import { DefaultTheme } from '../__nano-design__/theme';

export const SecretTheme = {
  ...DefaultTheme,

  // -- palette ----------------------------------------------------------------
  $colorBase: '#FFFFFF',
  $colorBorder: '#E2E2E2',
  $colorAccent: '#E1D558',
  // $colorAccent: '#E3CDF4',
  $colorContent: '#16161C',
  $colorContentLight: '#D5D2CE',
  // -- border -----------------------------------------------------------------
  $borderRadius: '$spaceS',
  // -- <Button> ---------------------------------------------------------------

  // -- <components> -----------------------------------------------------------
  $qrBackgroundColor: '#fff',
  $qrColor: '#111',
  $qrSize: Dimensions.get('window').width * 0.66,

  // -- <screens> --------------------------------------------------------------
  $importBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  $importColor: '#ffffff',
};
