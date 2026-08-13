import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Logo.style';
import { Text } from '../../design-system';

const Logo = ({ size }) => {
  const textProps = { bold: true, size: 'xl', style: size === 'l' ? style.large : style.compact };

  return (
    <Text {...textProps}>
      split
      <Text {...textProps} tone="accent">
        /
      </Text>
      Pass
    </Text>
  );
};

Logo.propTypes = {
  size: PropTypes.oneOf(['l', 'm']),
};

export { Logo };
