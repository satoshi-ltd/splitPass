import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { theme } from '../../theme';

const Icon = ({ size, style, tone, ...props }) => {
  const { colors } = useApp();

  const resolvedSize =
    typeof size === 'number'
      ? size
      : size === 'xl'
      ? theme.typography.iconSizes.title
      : size === 'l'
      ? theme.typography.iconSizes.subtitle
      : size === 'm'
      ? theme.typography.iconSizes.body
      : size === 's'
      ? theme.typography.iconSizes.caption
      : size === 'xxs'
      ? theme.typography.iconSizes.xxs || theme.typography.iconSizes.tiny
      : size === 'xs'
      ? theme.typography.iconSizes.tiny
      : theme.typography.iconSizes.body;

  const flattenedStyle = RNStyleSheet.flatten(style) || {};
  const toneColor =
    tone === 'secondary'
      ? colors.textSecondary
      : tone === 'accent'
      ? colors.accent
      : tone === 'danger'
      ? colors.danger
      : tone === 'warning'
      ? colors.warning
      : tone === 'onAccent'
      ? colors.onAccent || colors.text
      : tone === 'onInverse'
      ? colors.onInverse
      : tone === 'onScrim'
      ? colors.onScrim
      : colors.text;
  const resolvedColor = flattenedStyle.color || toneColor;

  return <MaterialCommunityIcons {...props} color={resolvedColor} size={resolvedSize} style={style} />;
};

export default Icon;
