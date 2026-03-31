import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const getStyles = (colors) =>
  StyleSheet.create({
    switch: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      height: 30,
      justifyContent: 'center',
      overflow: 'hidden',
      paddingHorizontal: 3,
      position: 'relative',
      width: 46,
    },
    checked: {
      backgroundColor: colors.surface,
      borderColor: colors.accent,
    },
    disabled: {
      borderColor: colors.border,
      opacity: 0.5,
    },
    fill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.accent,
      borderRadius: theme.borderRadius.md,
      opacity: 0.12,
    },
    thumbWrap: {
      left: 4,
      position: 'absolute',
      top: 4,
    },
    thumb: {
      backgroundColor: colors.text,
      borderRadius: theme.borderRadius.sm,
      height: 20,
      width: 20,
    },
    thumbChecked: {
      backgroundColor: colors.accent,
    },
    thumbDisabled: {
      backgroundColor: colors.textSecondary,
    },
  });

export { getStyles };
