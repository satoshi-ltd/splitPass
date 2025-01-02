import { DefaultTheme } from '@satoshi-ltd/nano-design/build/module/theme';
import { Dimensions } from 'react-native';

export const CommonTheme = {
  ...DefaultTheme,

  // -- palette ----------------------------------------------------------------
  // $colorAccent: '#E1D558',
  $colorAccent: '#FEF984',
  // $colorAccent: '#FDE835',

  // -- border -----------------------------------------------------------------
  $borderRadius: '$spaceS',
  $borderWidth: 1,

  // -- <Button> ---------------------------------------------------------------
  $buttonRadius: '$spaceXL',
  $buttonSmallHeight: '$spaceXL',

  // -- <Ipput> -----------------------------------------------------------------
  // $inputBackgroundColor: 'transparent',
  $inputBorderWidth: 0,
  $inputBackgroundColorFocus: 'transparent',

  // -- <components> -----------------------------------------------------------
  $qrBackgroundColor: '#ffffff',
  $qrColor: '#000000',
  $qrSize: Dimensions.get('window').width * 0.66,

  // -- <screens> --------------------------------------------------------------
  $importBackgroundColor: 'rgba(0, 0, 0, 0.85)',
};
