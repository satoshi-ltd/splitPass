import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Action.style';
import { Pressable, Text } from '../../primitives';

const Action = ({ children, color = 'accent', disabled, onPress = () => {}, ...others }) => {
  return (
    <Pressable onPress={!disabled ? onPress : undefined} style={style.action}>
      <Text align="center" bold {...others} color={disabled ? 'disabled' : color}>
        {children}
      </Text>
    </Pressable>
  );
};

Action.propTypes = {
  children: PropTypes.node,
  color: PropTypes.node,
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Action };
