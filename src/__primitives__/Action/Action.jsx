import PropTypes from 'prop-types';
import React from 'react';

import { Pressable } from '../Pressable';
import { Text } from '../Text';

const Action = ({ children, disabled, onPress = () => {}, ...others }) => {
  return (
    <Pressable {...others} onPress={!disabled ? onPress : undefined}>
      <Text action bold color={disabled ? 'disabled' : 'content'}>
        {children}
      </Text>
    </Pressable>
  );
};

Action.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Action };
