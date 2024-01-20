import { Dimensions } from 'react-native';

export const defaultTheme = {
  // -- palette ----------------------------------------------------------------
  // $colorAccent: '#6b52ae',
  $colorAccent: '#FBD90C',
  $colorAlert: '#ff5c5c',
  // $colorBase: '#f8f8f8',
  // $colorContent: '#333333',
  // $colorContentLight: '#777777',
  // $colorDisabled: '#999999',
  $colorBase: '#111111',
  $colorContent: '#ffffff',
  $colorContentLight: '#bbbbbb',
  $colorDisabled: '#666666',
  $colorModal: '$colorContent',

  // -- typography -------------------------------------------------------------
  $fontWeightDefault: 400,
  $fontWeightBold: 700,
  $fontSizeTitle: 28,
  $fontSizeSubtitle: 20,
  $fontSizeBody: 16,
  $fontSizeCaption: 13,
  $fontSizeTiny: 10,

  // -- spacing ----------------------------------------------------------------
  $spaceXS: 4,
  $spaceS: 8,
  $spaceM: 16,
  $spaceL: 24,
  $spaceXL: 32,

  // -- border -----------------------------------------------------------------
  $borderRadius: '$spaceS',
  $borderStyle: 'solid',
  $borderWidth: '$spaceXS / 2',

  // -- <primitives> -----------------------------------------------------------
  $buttonHeight: '$spaceXL + $spaceL',
  $buttonSmallHeight: '$spaceXL',
  $buttonRadius: '$spaceS',

  $inputBackgroundColor: 'rgba(255,255,255,0.05)',
  $inputBorderColor: '$colorContentLight',
  $inputBorderColorFocus: '$colorContent',
  $inputBorderColorValid: '$colorAccent',
  $inputBorderStyle: '$borderStyle',
  $inputBorderWidth: '$borderWidth',
  $inputFontFamily: 'font-bold',
  $inputFontWeight: '$fontWeightBold',
  $inputFontSize: '$fontSizeBody',
  $inputHeight: '$spaceXL',

  $pressableColor: 'rgba(0, 0, 0, 0.1)',

  // -- <components> -----------------------------------------------------------
  // $cardBackgroundColor: '#e5e5e5',
  // $cardBorderColor: 'transparent',
  $cardBackgroundColor: '$colorBase',
  $cardBorderColor: '$colorContent',
  $cardBorderStyle: '$borderStyle',
  $cardBorderWidth: '$borderWidth',

  $qrBackgroundColor: '#fff',
  $qrColor: '#111',
  $qrSize: Dimensions.get('window').width * 0.66,

  // -- <screens> --------------------------------------------------------------
  $importBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  $importColor: '#ffffff',
};
