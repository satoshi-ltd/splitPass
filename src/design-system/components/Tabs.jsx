import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { theme } from '../../theme';
import Icon from '../primitives/Icon';
import Pressable from '../primitives/Pressable';
import Text from '../primitives/Text';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      padding: 4,
    },
    tab: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: theme.spacing.sm,
      zIndex: 1,
    },
    activeIndicator: {
      backgroundColor: colors.accent,
      borderRadius: theme.borderRadius.md,
      bottom: 4,
      left: 4,
      position: 'absolute',
      top: 4,
    },
    compactContainer: {
      padding: 2,
    },
    compactTab: {
      gap: theme.spacing.xxs,
      minHeight: 32,
      paddingHorizontal: theme.spacing.xs,
    },
    compactIndicator: {
      bottom: 2,
      left: 2,
      top: 2,
    },
  });

const Tabs = ({ caption, compact, onChange, options = [], selected = 0, style }) => {
  const selectedId = typeof selected === 'number' ? options[selected]?.id : selected;
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const selectedIndex = options.findIndex((option, index) =>
    selectedId ? option.id === selectedId : index === selected,
  );
  const resolvedSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const inset = compact ? 2 : 4;
  const tabWidth = layoutWidth && options.length ? (layoutWidth - inset * 2) / options.length : 0;
  const indicatorWidth = tabWidth ? tabWidth - inset : 0;

  useEffect(() => {
    if (!tabWidth) return;

    Animated.timing(indicatorX, {
      duration: theme.animations.duration.quick,
      easing: Easing.out(Easing.cubic),
      toValue: resolvedSelectedIndex * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [indicatorX, resolvedSelectedIndex, tabWidth]);

  return (
    <View
      row
      onLayout={({ nativeEvent }) => setLayoutWidth(nativeEvent.layout.width)}
      style={[styles.container, compact && styles.compactContainer, style]}
    >
      {tabWidth ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            compact && styles.compactIndicator,
            { transform: [{ translateX: indicatorX }], width: indicatorWidth },
          ]}
        />
      ) : null}
      {options.map((option, index) => {
        const isActive = index === resolvedSelectedIndex;

        return (
          <Pressable
            key={option.id || option.text || index}
            onPress={() => onChange?.(option, index)}
            style={[styles.tab, compact && styles.compactTab]}
          >
            {option.icon ? (
              <Icon
                name={option.icon}
                size={compact || caption ? 's' : 'm'}
                style={{ color: isActive ? colors.onAccent : colors.text }}
              />
            ) : null}
            <Text bold size={compact || caption ? 's' : 'm'} tone={isActive ? 'onAccent' : 'primary'}>
              {option.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default Tabs;
