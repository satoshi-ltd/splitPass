import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Input.style';

const Input = React.forwardRef(
  ({ align, error = false, keyboard = 'text', placeholder, valid, value = '', onChange, ...others }, ref) => {
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
        placeholderTextColor={StyleSheet.value('$inputPlaceholderColor')}
        ref={ref}
        rows={rows}
        textAlignVertical="center"
        underlineColorAndroid="transparent"
        value={value?.toString()}
        onBlur={() => setFocus(false)}
        onChangeText={handleChange}
        onContentSizeChange={others.multiline && value?.length ? handleContentSizeChange : undefined}
        onFocus={() => setFocus(true)}
        onSubmitEditing={Keyboard.dismiss}
        style={[
          style.input,
          align && style[align],
          focus ? style.focus : error ? style.error : valid ? style.valid : undefined,
          others.style,
        ]}
      />
    );
  },
);

Input.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  error: PropTypes.bool,
  keyboard: PropTypes.string,
  placeholder: PropTypes.string,
  valid: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export { Input };
