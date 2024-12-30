import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { Image } from 'react-native';

import { style } from './Logo.style';
import { useStore } from '../../contexts';

const IMAGE = {
  light: require('../../../assets/images/logo-light.png'),
  dark: require('../../../assets/images/logo-dark.png'),
};

const Logo = ({ showText = false, ...others }) => {
  const { settings: { theme = 'light' } = {} } = useStore();

  return (
    <View row style={[style.container, others.style]}>
      <Image source={IMAGE[theme]} style={style.image} />
      {showText && (
        <Text bold title>
          clonara
        </Text>
      )}
    </View>
  );
};

Logo.propTypes = {
  showText: PropTypes.bool,
};

export { Logo };
