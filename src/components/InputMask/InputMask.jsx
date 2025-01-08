import { Input } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]*$/;
const MASK_CHAR = '●';

const InputMask = ({ value = '', onChange, ...props }) => {
  const [reveal, setReveal] = useState(false);

  const formatedValue = value.replace(/\n/g, ' ');

  const handleChange = (nextValue = '') =>
    onChange(
      ALPHANUMERIC_REGEX.test(nextValue) || !nextValue.length
        ? nextValue
        : nextValue.length >= value.length
        ? `${formatedValue}${nextValue.substring(formatedValue.length, nextValue.length)}`
        : `${formatedValue.substring(0, nextValue.length)}`,
    );

  const handlePressStart = () => setReveal(true);

  const handlePressEnd = () => setReveal(false);

  return (
    <Input
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      value={reveal ? formatedValue : formatedValue.replace(/\S/g, MASK_CHAR)}
      onTouchCancel={handlePressEnd}
      onTouchEnd={handlePressEnd}
      onTouchStart={handlePressStart}
      onChange={handleChange}
    />
  );
};

InputMask.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export { InputMask };
