import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { theme } from '../../theme';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'center',
    },
    dot: {
      backgroundColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      height: 6,
      width: 6,
    },
    active: {
      backgroundColor: colors.text,
      width: 18,
    },
  });

const Pagination = ({ currentIndex = 0, length = 0 }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <View key={`dot-${index}`} style={[styles.dot, index === currentIndex && styles.active]} />
      ))}
    </View>
  );
};

export default Pagination;
