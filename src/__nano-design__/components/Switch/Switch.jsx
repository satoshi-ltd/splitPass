import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Switch.style';
import { Pressable, View } from '../../primitives';

const Switch = ({ checked = false, disabled, onChange, ...others }) => (
  <Pressable
    {...others}
    onPress={onChange && !disabled ? () => onChange(!checked) : undefined}
    style={[style['switch'], disabled && style.disabled, others.style]}
  >
    {checked && <View style={[style.check, disabled && style.checkDisabled]}></View>}
  </Pressable>
);

Switch.displayName = 'Switch';

Switch.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.oneOf(['left', 'center', 'right']),
  onChange: PropTypes.func,
};

export { Switch };
