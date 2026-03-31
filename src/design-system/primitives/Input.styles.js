import { StyleSheet } from 'react-native';

import { inputPaddingHorizontal, inputPaddingVertical, inputTextHeight } from '../../theme/layout';
import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    base: {
      color: colors.text,
      fontFamily: 'font-default',
      fontSize: theme.typography.sizes.body,
      lineHeight: theme.typography.lineHeights.body,
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
