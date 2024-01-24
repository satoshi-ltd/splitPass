import PropTypes from 'prop-types';
import React from 'react';
import { Pressable as PressableBase, View as ViewBase } from 'react-native';

import { style } from './Pressable.style';

const Pressable = ({ children, feedback = true, onPress, ...others }) => (
  <PressableBase
    {...others}
    pointerEvents={onPress ? others.pointerEvents : 'none'}
    onPress={onPress}
    style={[style.container, others.style]}
  >
    {({ pressed }) => (
      <>
        {children}
        {feedback && pressed && <ViewBase pointerEvents="none" style={style.overflow} />}
      </>
    )}
  </PressableBase>
);

Pressable.displayName = 'Pressable';

Pressable.propTypes = {
  children: PropTypes.node,
  feedback: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Pressable };
