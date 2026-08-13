import PropTypes from 'prop-types';
import React from 'react';
import { Image } from 'react-native';

import { style } from './Logo.style';
import { useApp } from '../../contexts';

const IMAGE = {
  dark: require('../../../assets/images/logo-dark.png'),
  light: require('../../../assets/images/logo-light.png'),
};

const Logo = ({ size }) => {
  const { theme } = useApp();

  return (
    <Image
      resizeMode="contain"
      source={IMAGE[theme] || IMAGE.light}
      style={[style.image, size === 'l' ? style.imageLarge : null]}
    />
  );
};

Logo.propTypes = {
  size: PropTypes.oneOf(['l', 'm']),
};

export { Logo };
