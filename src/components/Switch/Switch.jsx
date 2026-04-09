import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { getStyles } from './Switch.style';
import { useApp } from '../../contexts';
import Pressable from '../../design-system/primitives/Pressable';
import View from '../../design-system/primitives/View';
import { theme } from '../../theme';

const Switch = ({ checked = false, disabled, onChange, ...others }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      duration: theme.animations.duration.quick,
      easing: Easing.out(Easing.cubic),
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [checked, progress]);

  const thumbStyle = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 15],
        }),
      },
    ],
  };

  const fillStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.12],
    }),
  };

  return (
    <Pressable
      {...others}
      onPress={onChange && !disabled ? () => onChange(!checked) : undefined}
      style={[style.switch, checked && style.checked, disabled && style.disabled, others.style]}
    >
      <Animated.View pointerEvents="none" style={[style.fill, fillStyle]} />
      <Animated.View style={[style.thumbWrap, thumbStyle]}>
        <View style={[style.thumb, checked && style.thumbChecked, disabled && style.thumbDisabled]} />
      </Animated.View>
    </Pressable>
  );
};

Switch.displayName = 'Switch';

Switch.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.oneOf(['left', 'center', 'right']),
  onChange: PropTypes.func,
};

export { Switch };
