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
    valueMain: {
      flex: 1,
      justifyContent: 'center',
      minHeight: theme.spacing.xl + theme.spacing.sm,
      minWidth: 0,
    },
    valueWrap: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 0,
      width: '100%',
      minWidth: 0,
    },
    totpWrap: {
      alignItems: 'flex-start',
      flex: 1,
      justifyContent: 'center',
      minWidth: 0,
      padding: 0,
    },
    totpTextBlock: {
      gap: theme.spacing.xs,
      justifyContent: 'center',
      minWidth: 0,
      width: '100%',
    },
    valueBlock: {
      flex: 1,
      gap: theme.spacing.xxs,
      justifyContent: 'center',
      minWidth: 0,
    },
    seedValueText: {
      flexShrink: 1,
      minWidth: 0,
    },
    valueCaption: {
      opacity: 0.82,
    },
    totpCodeText: {
      fontSize: theme.typography.sizes.title,
      includeFontPadding: false,
      letterSpacing: 2,
      lineHeight: theme.typography.lineHeights.title,
    },
    totpCaptionText: {
      fontSize: theme.typography.sizes.caption,
      lineHeight: theme.typography.sizes.caption,
      opacity: 0.82,
    },
    totpCountdownWrap: {
      alignItems: 'center',
      flexShrink: 0,
      justifyContent: 'center',
      position: 'relative',
    },
    totpCountdownValueWrap: {
      alignItems: 'center',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    totpCountdownText: {
      fontSize: theme.typography.sizes.body,
      fontVariant: ['tabular-nums'],
      includeFontPadding: false,
      lineHeight: theme.typography.lineHeights.body,
      textAlign: 'center',
      width: '100%',
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
    },
    controlsWrap: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      flexShrink: 0,
      gap: theme.spacing.sm,
      marginLeft: theme.spacing.md,
      minHeight: theme.spacing.xl + theme.spacing.sm,
    },
    valueGroup: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    cardValueWrap: {
      flex: 1,
      gap: theme.spacing.xxs,
      justifyContent: 'center',
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
