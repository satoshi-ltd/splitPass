import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Action.style';
import { Pressable } from '../Pressable';
import { Text } from '../Text';

const Action = ({ children, disabled, onPress = () => {}, ...others }) => {
  return (
    <Pressable onPress={!disabled ? onPress : undefined} style={style.action}>
      <Text {...others} action align="center" bold color={others.color || (disabled ? 'disabled' : 'content')}>
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
