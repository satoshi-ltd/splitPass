import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Card.style';
import { getColor } from './modules';
import { View } from '../../primitives';

const Card = ({ color, small, outlined = false, ...others }) => (
  <View
    {...others}
    style={[style.card, small && style.small, outlined ? style.outlined : getColor(color), others.style]}
  />
);

Card.displayName = 'Card';

Card.propTypes = {
  color: PropTypes.string,
  small: PropTypes.bool,
  outlined: PropTypes.bool,
};

export { Card };
