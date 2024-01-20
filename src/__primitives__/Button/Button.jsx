import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Button.style';
import { Pressable } from '../Pressable';
import { Text } from '../Text';

const Button = ({
  children,
  contrast = false,
  disabled,
  secondary = false,
  small = false,
  wide = false,
  onPress = () => {},
  ...others
}) => (
  <Pressable
    disabled={disabled}
    feedback
    onPress={onPress}
    style={[
      style.button,
      disabled && style.disabled,
      secondary && !disabled && style.secondary,
      contrast && style.contrast,
      small && style.small,
      wide && style.wide,
      others.style,
    ]}
  >
    <Text bold color={disabled || contrast ? 'base' : secondary ? 'content' : 'base'} caption={small}>
      {children}
    </Text>
  </Pressable>
);

Button.displayName = 'Button';

Button.propTypes = {
  bold: PropTypes.bool,
  children: PropTypes.node,
  contrast: PropTypes.bool,
  disabled: PropTypes.bool,
  secondary: PropTypes.bool,
  small: PropTypes.bool,
  wide: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Button };
