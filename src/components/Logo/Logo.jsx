import React from 'react';
import { Image } from 'react-native';

import { style } from './Logo.style';

const IMAGE = require('../../../assets/images/logo-light.png');

const Logo = () => <Image source={IMAGE} style={style.image} />;

export { Logo };
