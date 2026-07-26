import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      fontSize: theme.typography.sizes.body,
      lineHeight: theme.typography.lineHeights.body,
      fontFamily: 'font-default',
      color: colors.text,
    },
    bold: {
      fontFamily: 'font-bold',
    },
    semibold: {
      fontFamily: 'font-semibold',
    },
    title: {
      fontSize: theme.typography.sizes.title,
      lineHeight: theme.typography.lineHeights.title,
    },
    subtitle: {
      fontSize: theme.typography.sizes.subtitle,
      lineHeight: theme.typography.lineHeights.subtitle,
    },
    body: {
      fontSize: theme.typography.sizes.body,
      lineHeight: theme.typography.lineHeights.body,
    },
    caption: {
      fontSize: theme.typography.sizes.caption,
      lineHeight: theme.typography.lineHeights.caption,
    },
    tiny: {
      fontSize: theme.typography.sizes.tiny,
      lineHeight: theme.typography.lineHeights.tiny,
    },
    tonePrimary: {
      color: colors.text,
    },
    toneSecondary: {
      color: colors.textSecondary,
    },
    toneAccent: {
      color: colors.accent,
    },
    toneDanger: {
      color: colors.danger,
    },
    toneWarning: {
      color: colors.warning,
    },
    toneOnAccent: {
      color: colors.onAccent || colors.text,
    },
    toneOnInverse: {
      color: colors.onInverse,
    },
    toneOnScrim: {
      color: colors.onScrim,
    },
    alignLeft: {
      textAlign: 'left',
    },
    alignCenter: {
      textAlign: 'center',
    },
    alignRight: {
      textAlign: 'right',
    },
    flex: {
      flex: 1,
    },
  });
