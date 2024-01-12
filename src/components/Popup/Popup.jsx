import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { style } from './Popup.style';

const Popup = ({ children, content, isOpen, ...others }) => {
  return (
    <View style={[style.target, others.style]}>
      {children}
      {isOpen && <View style={[style.popup, others.popupStyle]}>{content}</View>}
    </View>
  );
};

Popup.propTypes = {
  content: PropTypes.node,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
};

export { Popup };
