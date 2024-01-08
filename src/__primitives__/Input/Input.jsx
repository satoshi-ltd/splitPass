import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Input.style';

const Input = ({ align, keyboard = 'text', placeholder = '...', value = '', onChange, ...others }) => {
  const [rows, setRows] = useState(1);
  const [focus, setFocus] = useState(false);

  const handleChange = (next = '') => {
    onChange && onChange(next.toString().length > 0 ? next : undefined);
  };

  const handleContentSizeChange = ({ nativeEvent: { contentSize: { height } = {} } = {} }) => {
    const spaceM = StyleSheet.value('$spaceM');
    const fontSize = StyleSheet.value('$inputFontSize');

    setRows(Math.floor(height / (fontSize + spaceM)) + 1);
  };

  return (
    <TextInput
      {...others}
      autoCapitalize="none"
      autoComplete="off"
      autoCorrect={false}
      blurOnSubmit
      inputMode={keyboard}
      placeholder={!focus ? placeholder : undefined}
      placeholderTextColor={StyleSheet.value('$colorContentLight')}
      rows={rows}
      textAlignVertical="center"
      underlineColorAndroid="transparent"
      value={value}
      onBlur={() => setFocus(false)}
      onChangeText={handleChange}
      onContentSizeChange={others.multiline && value?.length ? handleContentSizeChange : undefined}
      onFocus={() => setFocus(true)}
      onSubmitEditing={Keyboard.dismiss}
      style={[style.input, align && style[align], focus && style.focus]}
    />
  );
};

Input.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  keyboard: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export { Input };
