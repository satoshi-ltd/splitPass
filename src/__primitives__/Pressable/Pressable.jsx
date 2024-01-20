import PropTypes from 'prop-types';
import React from 'react';
import { Platform, Pressable as PressableBase, View as ViewBase } from 'react-native';

import { style } from './Pressable.style';
import { useKeyboard } from '../../hooks/useKeyboard';

const Pressable = ({ children, feedback = true, onPress, ...others }) => {
  const { isKeyboardOpen, closeKeyboard } = useKeyboard();

  const handlePress = (event) => {
    Platform.OS !== 'web' && isKeyboardOpen && closeKeyboard();
    onPress && onPress(event);
  };

  return (
    <PressableBase
      {...others}
      pointerEvents={onPress ? others.pointerEvents : 'none'}
      onPress={handlePress}
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
};

Pressable.displayName = 'Pressable';

Pressable.propTypes = {
  children: PropTypes.node,
  feedback: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Pressable };
