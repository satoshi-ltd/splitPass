import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { inputPaddingHorizontal, inputPaddingVertical, inputTextHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      borderColor: colors.border,
      borderWidth: 1,
      flexDirection: 'row',
    },
    base: {
      color: colors.text,
      fontFamily: 'font-semibold',
      fontSize: theme.typography.sizes.input,
      lineHeight: theme.typography.lineHeights.input,
      flex: 1,
      paddingHorizontal: inputPaddingHorizontal,
      paddingVertical: inputPaddingVertical,
      minHeight: inputTextHeight,
    },
    transparent: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
    },
    grow: {
      flex: 1,
    },
    multiline: {
      textAlignVertical: 'top',
      paddingTop: inputPaddingVertical,
    },
    withActions: {
      paddingRight: inputPaddingHorizontal / 2,
    },
    actions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      paddingRight: inputPaddingHorizontal,
    },
    focused: {
      borderColor: colors.accent,
      borderWidth: 1,
    },
    tonePrimary: {
      color: colors.text,
    },
    toneSecondary: {
      color: colors.textSecondary,
    },
    toneOnAccent: {
      color: colors.onAccent || colors.text,
    },
    toneOnInverse: {
      color: colors.onInverse,
    },
  });
