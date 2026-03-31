import React, { useMemo } from 'react';
import { Text as RNText } from 'react-native';

import { getStyles } from './Text.styles';
import { useApp } from '../../contexts';

const Text = ({ align, bold, flex, semibold, size, style, tone, ...props }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const sizeStyle =
    size === 'xl'
      ? styles.title
      : size === 'l'
      ? styles.subtitle
      : size === 's'
      ? styles.caption
      : size === 'xs'
      ? styles.tiny
      : styles.body;

  const toneStyle =
    tone === 'secondary'
      ? styles.toneSecondary
      : tone === 'accent'
      ? styles.toneAccent
      : tone === 'danger'
      ? styles.toneDanger
      : tone === 'warning'
      ? styles.toneWarning
      : tone === 'onAccent'
      ? styles.toneOnAccent
      : tone === 'onInverse'
      ? styles.toneOnInverse
      : styles.tonePrimary;

  const alignStyle =
    align === 'center' ? styles.alignCenter : align === 'right' ? styles.alignRight : align ? styles.alignLeft : null;

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        sizeStyle,
        semibold ? styles.semibold : null,
        bold ? styles.bold : null,
        toneStyle,
        alignStyle,
        flex ? styles.flex : null,
        style,
      ]}
    />
  );
};

export default Text;
