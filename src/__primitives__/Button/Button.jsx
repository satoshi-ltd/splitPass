import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Button.style';
import { Pressable } from '../Pressable';
import { Text } from '../Text';

const Button = ({ children, disabled, secondary = false, small = false, onPress = () => {}, ...others }) => (
  <Pressable
    disabled={disabled}
    feedback
    onPress={onPress}
    style={[
      style.button,
      disabled && style.disabled,
      secondary && !disabled && style.secondary,
      small && style.small,
      others.style,
    ]}
  >
    <Text bold color={disabled ? 'base' : secondary ? 'content' : 'base'} caption={small}>
      {children}
    </Text>
  </Pressable>
);

Button.propTypes = {
  action: PropTypes.bool,
  bold: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  secondary: PropTypes.bool,
  small: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Button };
