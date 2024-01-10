import { Dimensions } from 'react-native';

export const defaultTheme = {
  // -- palette
  // $colorAccent: '#6b52ae',
  $colorAccent: '#FBD90C',
  $colorAlert: '#ff5c5c',
  // $colorBase: '#f8f8f8',
  // $colorContent: '#333333',
  // $colorContentLight: '#777777',
  $colorBase: '#111111',
  $colorContent: '#ffffff',
  $colorContentLight: '#bbbbbb',
  $colorModal: '$colorBase',

  // -- typography
  $fontWeightDefault: 400,
  $fontWeightBold: 700,
  $fontSizeTitle: 36,
  $fontSizeSubtitle: 20,
  $fontSizeBody: 16,
  $fontSizeCaption: 13,
  $fontSizeTiny: 10,

  // -- spacing
  $spaceXS: 4,
  $spaceS: 8,
  $spaceM: 16,
  $spaceL: 24,
  $spaceXL: 32,

  // -- border
  $borderRadius: '$spaceS',
  $borderStyle: 'solid',
  $borderWidth: '$spaceXS / 2',

  // -- primitives
  $buttonHeight: '$spaceXL + $spaceL',
  $buttonSmallHeight: '$spaceXL',
  $buttonRadius: '$spaceS',

  $pressableColor: 'rgba(0, 0, 0, 0.1)',

  $inputFontFamily: 'font-bold',
  $inputFontWeight: '$fontWeightBold',
  $inputFontSize: '$fontSizeBody',
  $inputHeight: '$spaceXL',

  // -- components
  // $cardColor: '#e5e5e5',
  $cardColor: '#222222',

  $importBackgroundColor: 'rgba(0, 0, 0, 0.33)',
  $importColor: '#ffffff',

  $qrBackgroundColor: '#fff',
  $qrColor: '#111',
  $qrSize: Dimensions.get('window').width * 0.66,
};
