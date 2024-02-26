import { Input, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { style } from './InputPin.style';

const InputPin = ({ length = 6, onChange = () => {}, ...others }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const refs = Array.from({ length }).map(() => useRef(null));

  const [values, setValues] = useState(Array(length).fill(''));

  useEffect(() => {
    onChange(!values.includes('') ? values.join('') : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const handleChange = (value = '', index) => {
    const next = [...values];
    next[index] = value;
    setValues(next);

    if (value.length === 1 && index < refs.length - 1) {
      refs[index + 1].current.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } = {} } = {}, index) => {
    if (key === 'Backspace' && index > 0) {
      const next = [...values];
      next[index] = '';
      setValues(next);

      refs[index - 1].current.focus();
    }
  };

  return (
    <View {...others} row spaceBetween wide>
      {refs.map((inputRef, index) => (
        <Input
          align="center"
          key={index}
          keyboard="numeric"
          maxLength={1}
          ref={inputRef}
          secureTextEntry
          valid={values[index] !== ''}
          value={values[index]}
          onChange={(value) => handleChange(value, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          style={style.input}
        />
      ))}
    </View>
  );
};

InputPin.displayName = 'InputPin';

InputPin.propTypes = {
  length: PropTypes.number,
  onChange: PropTypes.func,
};

export { InputPin };
