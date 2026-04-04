import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const getStyles = (colors, contrast) => {
  const passcodeBackgroundColor =
    contrast === 'accent'
      ? 'rgba(255, 255, 255, 0.14)'
      : contrast === 'dark'
      ? 'rgba(255, 252, 248, 0.08)'
      : 'rgba(24, 19, 16, 0.06)';
  const passcodeConfirmBackgroundColor = contrast === 'accent' ? colors.onAccent : colors.onInverse;

  return StyleSheet.create({
    passcodeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      minHeight: theme.spacing.xxl + theme.spacing.md,
    },
    passcodeInputWrap: {
      alignItems: 'center',
      backgroundColor: passcodeBackgroundColor,
      borderRadius: 0,
      flex: 1,
      minHeight: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
    },
    passcodeInput: {
      paddingHorizontal: 0,
      paddingVertical: theme.spacing.xs,
    },
    passcodeButton: {
      minWidth: theme.spacing.xl,
    },
    passcodeButtonConfirm: {
      backgroundColor: passcodeConfirmBackgroundColor,
      borderWidth: 0,
    },
    passcodeButtonConfirmDisabled: {
      backgroundColor: passcodeConfirmBackgroundColor,
      borderWidth: 0,
      opacity: 0.38,
    },
    valueRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      minHeight: theme.spacing.xxl + theme.spacing.md,
      width: '100%',
    },
    valueRowTopAligned: {
      alignItems: 'flex-start',
    },
    valueWrap: {
      alignItems: 'flex-start',
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 0,
      minWidth: 0,
    },
    totpWrap: {
      alignItems: 'flex-start',
      flex: 1,
      gap: theme.spacing.xs,
      justifyContent: 'center',
      minWidth: 0,
      padding: 0,
    },
    valueBlock: {
      flex: 1,
      gap: theme.spacing.xxs,
      minWidth: 0,
    },
    seedValueText: {
      flexShrink: 1,
      minWidth: 0,
      paddingBottom: theme.spacing.xs,
    },
    valueCaption: {
      opacity: 0.82,
    },
    totpCodeText: {
      fontSize: theme.typography.sizes.title,
      letterSpacing: 2,
      lineHeight: theme.typography.sizes.title,
    },
    totpCaptionText: {
      fontSize: theme.typography.sizes.caption,
      lineHeight: theme.typography.sizes.caption,
      opacity: 0.82,
    },
    shardWrap: {
      flex: 1,
      justifyContent: 'center',
      minWidth: 0,
    },
    shardCaption: {
      marginTop: theme.spacing.xxs,
      opacity: 0.82,
    },
    actionsWrap: {
      alignSelf: 'center',
      flexShrink: 0,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginLeft: theme.spacing.md,
    },
    actionsWrapTopAligned: {
      alignSelf: 'flex-start',
      marginTop: theme.spacing.xxs,
    },
    valueGroup: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    cardValueWrap: {
      flex: 1,
      gap: theme.spacing.xxs,
      minWidth: 0,
    },
    cardNumberText: {
      fontSize: theme.typography.sizes.subtitle,
      lineHeight: theme.typography.lineHeights.subtitle,
    },
    cardMetaRow: {
      minHeight: theme.typography.lineHeights.body,
    },
    cardMetaText: {
      lineHeight: theme.typography.lineHeights.body,
      opacity: 0.82,
    },
    valueTextCompact: {
      fontSize: theme.typography.sizes.body,
      lineHeight: theme.typography.lineHeights.body,
    },
    valueTextDense: {
      lineHeight: theme.typography.lineHeights.caption,
    },
    valueTextHero: {
      lineHeight: theme.typography.lineHeights.title,
    },
  });
};

export { getStyles };
