import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Icon.style';

const NAMES = {
  alert: 'alert-box-outline',
  info: 'information-outline',
  qr: 'qrcode',
  scan: 'line-scan',
  settings: 'cog-outline',
  vault: 'safe-square-outline',
};

const Icon = ({ color, name, ...others }) => (
  <MaterialCommunityIcons
    {...others}
    color={color}
    name={NAMES[name]}
    style={[style.icon, style[color], others.style]}
  />
);

Icon.displayName = 'Icon';

Icon.propTypes = {
  color: PropTypes.string,
  name: PropTypes.oneOf(Object.keys(NAMES)),
};

export { Icon };
