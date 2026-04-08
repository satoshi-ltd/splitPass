import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Switch } from '../../components/Switch/Switch';
import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { theme } from '../../theme';
import Icon from '../primitives/Icon';
import Pressable from '../primitives/Pressable';
import Text from '../primitives/Text';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      minHeight: theme.spacing.xxl + theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    disabled: {
      opacity: 0.5,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    left: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    thumbnail: {
      alignItems: 'center',
      alignContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 0,
      height: theme.spacing.xxl,
      justifyContent: 'center',
      width: theme.spacing.xxl,
    },
    action: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: theme.spacing.lg,
    },
  });

const resolveOptionLabel = (option) => option?.text || option?.label || option?.caption || option?.value;

const Setting = ({
  activity,
  disabled,
  icon,
  iconTone,
  onChange,
  onPress,
  options,
  right,
  selected,
  style,
  subtitle,
  subtitleTone,
  title,
  titleTone,
  type = 'navigation',
  value,
  onValueChange,
  ...props
}) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selectedIndex = options?.findIndex((option) => option?.id === selected || option?.value === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options?.[0];
  const isToggle = type === 'toggle';

  const handlePress = () => {
    if (disabled) return;
    if (isToggle && onValueChange) return onValueChange(!value);
    if (options?.length && onChange) {
      const nextIndex = selectedIndex >= 0 ? (selectedIndex + 1) % options.length : 0;
      onChange(options[nextIndex]);
    }
    if (onPress) onPress();
  };

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={isToggle ? undefined : handlePress}
      style={[styles.container, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          {icon ? (
            <View style={styles.thumbnail}>
              <Icon name={icon} tone={iconTone || 'primary'} />
            </View>
          ) : null}
          <View flex>
            {titleTone ? (
              <Text semibold tone={titleTone}>
                {title}
              </Text>
            ) : (
              <Text semibold>{title}</Text>
            )}
            {subtitle ? (
              <Text size="s" tone={subtitleTone || 'secondary'}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.action}>
          {right ? (
            right
          ) : activity ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : isToggle ? (
            <Switch checked={!!value} disabled={disabled} onChange={onValueChange} />
          ) : options?.length ? (
            <Text size="s" tone="secondary">
              {resolveOptionLabel(selectedOption)}
            </Text>
          ) : type === 'navigation' ? (
            <Icon name={ICON.RIGHT} tone="secondary" />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default Setting;
