import { DefaultTheme } from '@satoshi-ltd/nano-design/build/module/theme';
import { Dimensions } from 'react-native';

export const SecretTheme = {
  ...DefaultTheme,

  // -- palette ----------------------------------------------------------------
  // $colorAccent: '#E1D558',
  $colorAccent: '#FEF984',

  // $colorBase: '#000000',
  // $colorBorder: '#222222',
  // $colorContent: '#ffffff',
  // $colorContentLight: '#999999',

  // -- border -----------------------------------------------------------------
  // $borderRadius: '$spaceXS',
  // $borderWidth: '$spaceXXS',
  $borderRadius: 2,
  $borderWidth: 1,

  $buttonRadius: 2,

  // -- <Ipput> -----------------------------------------------------------------
  $inputBackgroundColor: 'transparent',
  $inputBackgroundColorFocus: 'transparent',
  $inputBorderColorFocus: 'transparent',

  // -- <components> -----------------------------------------------------------
  $qrBackgroundColor: '#fff',
  $qrColor: '#111',
  $qrSize: Dimensions.get('window').width * 0.66,

  // -- <screens> --------------------------------------------------------------
  $importBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  $importColor: '#ffffff',
};
