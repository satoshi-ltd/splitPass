import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Icon.style';
import { getSize } from './modules';
import { getColor } from '../Text/modules';

const Icon = ({
  color,
  name,
  // -- size
  title,
  subtitle = true,
  caption,
  tiny,
  ...others
}) => (
  <MaterialCommunityIcons
    {...others}
    name={name}
    color={color}
    style={[style.icon, getColor(color), getSize({ title, subtitle, caption, tiny }), others.style]}
  />
);

Icon.propTypes = {
  color: PropTypes.string,
  name: PropTypes.string.isRequired,
  // -- size
  title: PropTypes.bool,
  subtitle: PropTypes.bool,
  caption: PropTypes.bool,
  tiny: PropTypes.bool,
};

export { Icon };
