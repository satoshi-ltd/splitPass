import PropTypes from 'prop-types';
import React from 'react';

import { Input } from '../../design-system';

const MASK_CHAR = '*';

const InputMask = ({ value = '', onChange, revealed = false, ...props }) => {
  const resolvedValue = `${value}`;
  const maskedValue = resolvedValue.replace(/[^\s]/g, MASK_CHAR);

  const handleChange = (nextValue = '') => {
    if (!onChange) return;
    if (revealed) return onChange(nextValue);
    if (!nextValue.length) return onChange('');

    if (nextValue.length >= resolvedValue.length) {
      return onChange(`${resolvedValue}${nextValue.substring(resolvedValue.length)}`);
    }

    return onChange(resolvedValue.substring(0, nextValue.length));
  };

  return (
    <Input
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      value={revealed ? resolvedValue : maskedValue}
      onChange={handleChange}
    />
  );
};

InputMask.propTypes = {
  revealed: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export { InputMask };
