import PropTypes from "prop-types";
import React, { useState } from "react";
import { Keyboard, TextInput } from "react-native";
import StyleSheet from "react-native-extended-stylesheet";

import { style } from "./Input.style";

const Input = ({
  align,
  keyboard = "default",
  placeholder = "...",
  value = "",
  onChange,
  ...others
}) => {
  const [numberOfLines, setNumberOfLines] = useState(1);
  const [focus, setFocus] = useState(false);

  const handleChange = (next = "") => {
    onChange && onChange(next.toString().length > 0 ? next : undefined);
  };

  const handleContentSizeChange = ({
    nativeEvent: { contentSize: { height } = {} } = {},
  }) => {
    const spaceM = StyleSheet.value("$spaceM");
    const fontSize = StyleSheet.value("$inputFontSize");

    setNumberOfLines(Math.floor(height / (fontSize + spaceM)) + 1);
  };

  return (
    <TextInput
      {...others}
      autoCapitalize="none"
      autoComplete="off"
      autoCorrect={false}
      blurOnSubmit
      editable
      keyboardType={keyboard}
      numberOfLines={numberOfLines}
      placeholder={!focus ? placeholder : undefined}
      underlineColorAndroid="transparent"
      value={value}
      onBlur={() => setFocus(false)}
      onChangeText={handleChange}
      onContentSizeChange={
        others.multiline && value?.length ? handleContentSizeChange : undefined
      }
      onFocus={() => setFocus(true)}
      onSubmitEditing={Keyboard.dismiss}
      style={[style.input, align && style[align], focus && style.focus]}
    />
  );
};

Input.propTypes = {
  align: PropTypes.oneOf(["left", "center", "right"]),
  keyboard: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export { Input };
