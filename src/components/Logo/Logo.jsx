import PropTypes from 'prop-types';
import React from 'react';
import { Image } from 'react-native';

import { style } from './Logo.style';
import { useStore } from '../../contexts';

const IMAGE = {
  light: require('../../../assets/images/logo-light.png'),
  dark: require('../../../assets/images/logo-dark.png'),
};

const Logo = ({ forceTheme }) => {
  const { settings: { theme } = {} } = useStore();

  return <Image source={IMAGE[forceTheme || theme]} style={style.image} />;
};

Logo.propTypes = {
  forceTheme: PropTypes.string,
};

export { Logo };
