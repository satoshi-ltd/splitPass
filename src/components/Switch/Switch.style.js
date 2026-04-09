import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const getStyles = (colors) =>
  StyleSheet.create({
    switch: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      height: 26,
      justifyContent: 'center',
      overflow: 'hidden',
      paddingHorizontal: 2,
      position: 'relative',
      width: 40,
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
      borderRadius: theme.borderRadius.sm,
      opacity: 0.12,
    },
    thumbWrap: {
      left: 3,
      position: 'absolute',
      top: 4,
    },
    thumb: {
      backgroundColor: colors.text,
      borderRadius: theme.borderRadius.sm,
      height: 16,
      width: 16,
    },
    thumbChecked: {
      backgroundColor: colors.accent,
    },
    thumbDisabled: {
      backgroundColor: colors.textSecondary,
    },
  });

export { getStyles };
