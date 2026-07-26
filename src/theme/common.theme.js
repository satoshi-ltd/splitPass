import { paletteLight, radius } from './palette';

export const CommonTheme = {
  $colorAccent: paletteLight.accent,
  $colorDark: paletteLight.dark,
  $colorLight: paletteLight.light,
  $colorBase: paletteLight.background,
  $colorSurface: paletteLight.surface,
  $colorBorder: paletteLight.border,
  $colorContent: paletteLight.content,
  $colorContentLight: paletteLight.contentMuted,
  $colorDisabled: paletteLight.disabled,

  $borderRadius: radius,
  $borderStyle: 'solid',
  $borderWidth: 1,

  $fontSizeCaption: 13,
  $fontSizeTitle: 28,

  $spaceXXS: 4,
  $spaceXS: 8,
  $spaceS: 12,
  $spaceM: 16,
  $spaceL: 24,
  $spaceXL: 32,
  $spaceXXL: 48,
  $viewOffset: '$spaceL',

  $buttonRadius: radius,
  $buttonSmallHeight: '$spaceXL',
  $buttonChildrenColorSecondary: '$colorDark',

  $inputBackgroundColor: '$colorSurface',
  $inputBorderWidth: 0,
  $inputBackgroundColorFocus: '$colorSurface',
  $modalOverflowBackgroundColor: paletteLight.overlay,

  $qrBackgroundColor: '$colorLight',
  $qrColor: '$colorDark',
  $qrSize: 232,

  $scannerBackground: '$colorDark',
  $scannerBackgroundOpacity: 'rgba(0, 0, 0, 0.85)',
  $scannerTextColor: '$colorLight',

  $splitCardHeight: 208,
  $splitCardWidth: 328,
};
