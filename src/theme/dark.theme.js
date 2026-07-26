import { CommonTheme } from './common.theme';
import { paletteDark } from './palette';

export const DarkTheme = {
  $theme: 'dark',

  ...CommonTheme,
  $colorBase: paletteDark.background,
  $colorSurface: paletteDark.surface,
  $colorBorder: paletteDark.border,
  $colorContent: paletteDark.content,
  $colorContentLight: paletteDark.contentMuted,
  $colorLight: paletteDark.light,
  $colorDark: paletteDark.dark,
  $modalOverflowBackgroundColor: paletteDark.overlay,
  $qrBackgroundColor: '$colorLight',
  $qrColor: paletteDark.qrForeground,
};
