import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    backdropPressable: {
      flex: 1,
    },
    keyboardAvoid: {
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '92%',
      overflow: 'hidden',
    },
    handle: {
      alignSelf: 'center',
      backgroundColor: colors.border,
      borderRadius: theme.borderRadius.full,
      height: 4,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      width: theme.spacing.xl,
    },
    container: {
      alignSelf: 'stretch',
      paddingBottom: viewOffset,
      paddingHorizontal: viewOffset,
    },
    content: {
      gap: theme.spacing.sm,
    },
  });
