import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { theme } from '../../theme';
import Pressable from '../primitives/Pressable';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      padding: theme.spacing.md,
    },
    accent: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    outlined: {
      backgroundColor: 'transparent',
    },
    small: {
      padding: theme.spacing.sm,
    },
  });

const Card = ({ align, color, gap, onPress, outlined, row, small, spaceBetween, style, ...props }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const content = [
    styles.base,
    color === 'accent' ? styles.accent : null,
    outlined ? styles.outlined : null,
    small ? styles.small : null,
    row ? { flexDirection: 'row' } : null,
    gap ? { gap: gap === true ? theme.spacing.sm : gap } : null,
    spaceBetween ? { justifyContent: 'space-between' } : null,
    align ? { alignItems: align } : null,
    style,
  ];

  if (onPress) return <Pressable {...props} onPress={onPress} style={content} />;
  return <View {...props} style={content} />;
};

export default Card;
