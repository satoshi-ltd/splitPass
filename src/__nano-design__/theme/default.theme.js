export const DefaultTheme = {
  // -- palette ----------------------------------------------------------------
  // $colorAccent: '#FBD90C',
  $colorAccent: '#FDCE44',
  $colorBase: '#FFFEFE',
  $colorBorder: '#f0f0f0',
  $colorContent: '#000000',
  $colorContentLight: '#595859',
  $colorDisabled: '#999999',

  // States
  $colorError: '#ff5c5c',
  $colorWarning: '#ff5c5c',
  $colorSuccess: '#ff5c5c',

  // -- typography -------------------------------------------------------------
  $fontWeightDefault: 400,
  $fontWeightBold: 700,
  $fontSizeTitle: 28,
  $fontSizeSubtitle: 20,
  $fontSizeBody: 16,
  $fontSizeCaption: 13,
  $fontSizeTiny: 10,

  // -- spacing ----------------------------------------------------------------
  $spaceXXS: 2,
  $spaceXS: 4,
  $spaceS: 8,
  $spaceM: 16,
  $spaceL: 24,
  $spaceXL: 32,
  $spaceXXL: 40,

  // -- border -----------------------------------------------------------------
  $borderColor: '$colorContent',
  $borderRadius: '$spaceS',
  $borderStyle: 'solid',
  $borderWidth: '$spaceXXS',

  // == <primitives> ===========================================================
  // -- <Input> ----------------------------------------------------------------
  $inputBackgroundColor: '$colorBorder',
  $inputBorderColor: '$inputBackgroundColor',
  $inputBorderStyle: '$borderStyle',
  $inputBorderWidth: '$borderWidth',
  $inputFontFamily: 'font-bold',
  $inputFontWeight: '$fontWeightDefault',
  $inputFontSize: '$fontSizeBody',
  $inputPaddingHorizontaL: '$spaceM',
  $inputPaddingVertical: '$spaceM - $borderWidth',
  $inputPlaceholderColor: '$colorDisabled',
  // -- focus
  $inputBackgroundColorFocus: 'transparent',
  $inputBorderColorFocus: '$colorContent',
  // -- error
  $inputBackgroundColorError: '$inputBackgroundColorFocus',
  $inputBorderColorError: '$colorError',
  // -- valid
  $inputBackgroundColorValid: '$inputBackgroundColorFocus',
  $inputBorderColorValid: '$colorAccent',

  // -- <View> --------------------------------------------------------------------
  $viewOffset: '$spaceM',

  // == <components> ===========================================================
  // -- <Button> ---------------------------------------------------------------
  $buttonColorPrimary: '$colorContent',
  $buttonColorSecondary: '$colorAccent',
  $buttonHeight: '$spaceXL + $spaceL',
  $buttonSmallHeight: '$spaceXL',
  $buttonRadius: '$spaceS',

  // -- <Pagination> -----------------------------------------------------------
  $paginationSize: '$spaceS',
  $paginationColor: '$colorBorder',
  $paginationColorActive: '$colorContent',
};
