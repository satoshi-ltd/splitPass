import { DefaultTheme } from '@satoshi-ltd/nano-design/build/module/theme';
import { Dimensions } from 'react-native';

export const SecretTheme = {
  ...DefaultTheme,

  // -- palette ----------------------------------------------------------------
  // $colorAccent: '#E1D558',

  // -- border -----------------------------------------------------------------
  // $borderRadius: '$spaceXS',
  // $borderWidth: '$spaceXXS',

  // -- <components> -----------------------------------------------------------
  $qrBackgroundColor: '#fff',
  $qrColor: '#111',
  $qrSize: Dimensions.get('window').width * 0.66,

  // -- <screens> --------------------------------------------------------------
  $importBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  $importColor: '#ffffff',
};
