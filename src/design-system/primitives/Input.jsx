import React, { useMemo } from 'react';
import { TextInput, View } from 'react-native';

import { getStyles } from './Input.styles';
import { useApp } from '../../contexts';

const Input = React.forwardRef(
  (
    {
      blurOnSubmit = true,
      containerStyle,
      editable = true,
      grow = false,
      multiline = false,
      onBlur,
      onChange,
      onChangeText,
      onFocus,
      actions,
      placeholder,
      placeholderTextColor,
      placeholderTone = 'secondary',
      placeholderWhenBlur = '...',
      style,
      tone = 'primary',
      variant,
      value,
      ...props
    },
    ref,
  ) => {
    const { colors } = useApp();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [focused, setFocused] = React.useState(false);

    const handleChangeText = (text) => {
      if (onChangeText) onChangeText(text);
      if (onChange) onChange(text);
    };

    const handleBlur = (event) => {
      setFocused(false);
      if (onBlur) onBlur(event);
    };

    const handleFocus = (event) => {
      setFocused(true);
      if (onFocus) onFocus(event);
    };

    const resolvedPlaceholder = placeholder !== undefined ? placeholder : focused ? undefined : placeholderWhenBlur;
    const toneStyle =
      tone === 'onAccent'
        ? styles.toneOnAccent
        : tone === 'onInverse'
        ? styles.toneOnInverse
        : tone === 'secondary'
        ? styles.toneSecondary
        : styles.tonePrimary;
    const resolvedPlaceholderTextColor =
      placeholderTextColor ??
      (placeholderTone === 'onAccent'
        ? styles.toneOnAccent.color
        : placeholderTone === 'onInverse'
        ? styles.toneOnInverse.color
        : placeholderTone === 'primary'
        ? styles.tonePrimary.color
        : styles.toneSecondary.color);

    const inputNode = (
      <TextInput
        ref={ref}
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={blurOnSubmit}
        editable={editable}
        multiline={multiline}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={resolvedPlaceholderTextColor}
        underlineColorAndroid="transparent"
        value={value}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        {...props}
        style={[
          styles.base,
          toneStyle,
          variant === 'transparent' ? styles.transparent : null,
          grow ? styles.grow : null,
          multiline ? styles.multiline : null,
          actions ? styles.withActions : null,
          style,
        ]}
      />
    );

    if (!actions && !containerStyle) return inputNode;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {inputNode}
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;
