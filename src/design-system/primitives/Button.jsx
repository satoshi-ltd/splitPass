import React, { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';

import { getStyles } from './Button.styles';
import Icon from './Icon';
import Pressable from './Pressable';
import Text from './Text';
import { useApp } from '../../contexts';

const Button = ({ children, disabled, grow, icon, loading, onPress, size, style, tone, variant, ...props }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  const iconOnly = !!icon && !children;

  const resolvedVariant = variant || 'primary';
  const resolvedSize = size || 'm';

  const defaultTone = isDisabled
    ? 'secondary'
    : resolvedVariant === 'primary'
    ? 'onAccent'
    : resolvedVariant === 'secondary'
    ? 'onInverse'
    : 'primary';
  const contentTone = tone || defaultTone;

  const sizeStyle = resolvedSize === 's' ? styles.small : resolvedSize === 'l' ? styles.large : null;
  const iconSizeStyle =
    iconOnly && resolvedSize === 's'
      ? styles.iconOnlySmall
      : iconOnly && resolvedSize === 'l'
      ? styles.iconOnlyLarge
      : iconOnly
      ? styles.iconOnly
      : null;

  const variantStyle =
    resolvedVariant === 'outlined'
      ? styles.outlined
      : resolvedVariant === 'secondary'
      ? styles.secondary
      : styles.primary;

  const disabledVariantStyle =
    isDisabled && resolvedVariant === 'outlined'
      ? styles.disabledOutlined
      : isDisabled && resolvedVariant === 'secondary'
      ? styles.disabledSecondary
      : isDisabled
      ? styles.disabledPrimary
      : null;

  const iconSize = resolvedSize === 's' ? 'xs' : resolvedSize === 'm' ? 'l' : 'xl';

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        iconOnly && styles.iconOnly,
        iconSizeStyle,
        variantStyle,
        resolvedVariant === 'outlined' && contentTone === 'onInverse'
          ? { borderColor: colors.onInverse }
          : resolvedVariant === 'outlined' && contentTone === 'onAccent'
          ? { borderColor: colors.onAccent }
          : null,
        grow && styles.grow,
        disabledVariantStyle,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            contentTone === 'onInverse'
              ? colors.onInverse
              : contentTone === 'onAccent'
              ? colors.onAccent
              : contentTone === 'secondary'
              ? colors.textSecondary
              : colors.text
          }
        />
      ) : (
        <>
          {icon ? <Icon name={icon} tone={contentTone} size={iconSize} /> : null}
          {children ? (
            <Text semibold size={resolvedSize === 's' ? 's' : 'm'} tone={contentTone}>
              {children}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
};

export default Button;
