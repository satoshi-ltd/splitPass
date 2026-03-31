import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';
import ScrollView from '../primitives/ScrollView';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.background,
      paddingBottom: viewOffset,
    },
    offset: {
      paddingHorizontal: theme.spacing.lg,
    },
    gap: {
      gap: theme.spacing.md,
    },
  });

const Screen = React.forwardRef(({ children, disableScroll, gap, offset, style, ...props }, ref) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const contentStyle = [offset && styles.offset, gap && styles.gap, style];

  if (disableScroll) {
    return (
      <View {...props} style={[styles.base, ...contentStyle]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView ref={ref} {...props} contentContainerStyle={[styles.base, ...contentStyle]}>
      {children}
    </ScrollView>
  );
});

Screen.displayName = 'Screen';

export default Screen;
