import { DefaultTheme } from '@satoshi-ltd/nano-design/build/module/theme';

export const CommonTheme = {
  ...DefaultTheme,

  // -- palette ----------------------------------------------------------------
  $colorAccent: '#FEF984',
  // $colorAccent: '#FDE835',
  $colorDark: '#000',
  $colorLight: '#fff',

  // -- border -----------------------------------------------------------------
  $borderRadius: '$spaceS',
  $borderWidth: 1,

  // -- <Button> ---------------------------------------------------------------
  $buttonRadius: '$spaceXL',
  $buttonSmallHeight: '$spaceXL',

  // -- <Ipput> -----------------------------------------------------------------
  $inputBorderWidth: 0,
  $inputBackgroundColorFocus: 'transparent',

  // -- <components> -----------------------------------------------------------
  $qrBackgroundColor: '$colorLight',
  $qrColor: '$colorDark',
  $qrSize: 232,

  // -- <screens> --------------------------------------------------------------
  $scannerBackground: '$colorDark',
  $scannerBackgroundOpacity: 'rgba(0, 0, 0, 0.85)',
  $scannerTextColor: '$colorLight',

  $splitCardHeight: 208,
  $splitCardWidth: 328,
};
