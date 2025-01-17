import { DefaultTheme } from '@satoshi-ltd/nano-design/build/module/theme';

export const CommonTheme = {
  ...DefaultTheme,

  // -- palette ----------------------------------------------------------------
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
  $qrSize: 232,

  // -- <screens> --------------------------------------------------------------
  $scannerBackground: '#000000',
  $scannerBackgroundOpacity: 'rgba(0, 0, 0, 0.85)',
};
