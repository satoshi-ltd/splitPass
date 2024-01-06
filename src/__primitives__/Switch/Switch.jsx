import PropTypes from "prop-types";
import React from "react";

import { style } from "./Switch.style";
import { Pressable } from "../Pressable";
import { View } from "../View";

const Switch = ({ checked = false, disabled, onPress, ...others }) => (
  <Pressable
    {...others}
    onPress={onPress && !disabled ? () => onPress(!checked) : undefined}
    style={[style["switch"], disabled && style.disabled, others.style]}
  >
    {checked && (
      <View style={[style.check, disabled && style.checkDisabled]}></View>
    )}
  </Pressable>
);

Switch.displayName = "Switch";

Switch.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.oneOf(["left", "center", "right"]),
  onPress: PropTypes.func,
};

export { Switch };
