import { View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Frame.style';

const Frame = ({ children, card = false, ...others }) => {
  return (
    <View {...others} style={[style.frame, card && style.card, others.style]}>
      <View style={[style.corner, style.topLeft]} />
      <View style={[style.corner, style.topRight]} />
      <View style={[style.corner, style.bottomLeft]} />
      <View style={[style.corner, style.bottomRight]} />

      {children}
    </View>
  );
};

Frame.propTypes = {
  children: PropTypes.node,
  card: PropTypes.node,
};

export { Frame };
