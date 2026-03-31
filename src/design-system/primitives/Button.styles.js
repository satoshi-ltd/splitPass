import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
      minHeight: 44,
    },
    grow: {
      flex: 1,
    },
    small: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      minHeight: 36,
    },
    large: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minHeight: 52,
    },
    iconOnly: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      width: theme.spacing.xl + theme.spacing.sm,
      height: theme.spacing.xl + theme.spacing.sm,
      minWidth: theme.spacing.xl + theme.spacing.sm,
      minHeight: theme.spacing.xl + theme.spacing.sm,
    },
    iconOnlySmall: {
      width: theme.spacing.xl,
      height: theme.spacing.xl,
      minWidth: theme.spacing.xl,
      minHeight: theme.spacing.xl,
    },
    iconOnlyLarge: {
      width: theme.spacing.xxl,
      height: theme.spacing.xxl,
      minWidth: theme.spacing.xxl,
      minHeight: theme.spacing.xxl,
    },
    primary: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: colors.inverse,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    disabledPrimary: {
      backgroundColor: colors.border,
    },
    disabledSecondary: {
      backgroundColor: colors.border,
    },
    disabledOutlined: {
      borderColor: colors.border,
    },
    pressed: {
      opacity: 0.92,
    },
  });
