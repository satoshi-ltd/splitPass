import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Button.style';
import { Pressable, Text } from '../../primitives';

const Button = ({
  children,
  disabled,
  flex = false,
  outlined = false,
  secondary = false,
  small = false,
  onPress = () => {},
  ...others
}) => (
  <Pressable
    disabled={disabled}
    feedback
    onPress={onPress}
    style={[
      style.button,
      disabled ? style.disabled : secondary ? style.secondary : outlined ? style.outlined : style.primary,
      flex && style.flex,
      small && style.small,
      others.style,
    ]}
  >
    <Text bold caption={small} color={disabled ? 'disabled' : secondary || outlined ? 'content' : 'base'}>
      {children}
    </Text>
  </Pressable>
);

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  flex: PropTypes.bool,
  outlined: PropTypes.bool,
  secondary: PropTypes.bool,
  small: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Button };
