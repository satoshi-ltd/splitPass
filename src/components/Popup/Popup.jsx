import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';

import { style } from './Popup.style';

const Popup = ({ children, content, isOpen, ...others }) => {
  const [isBottom, setIsBottom] = useState(false);

  const handleLayout = (event) => {
    const { y } = event.nativeEvent.layout;
    const windowHeight = Dimensions.get('window').height;
    setIsBottom(Math.abs(y) > windowHeight / 2);
  };

  return (
    <View onLayout={handleLayout} style={[style.target, others.style]}>
      {children}
      {isOpen && (
        <View style={[style.popup, isBottom ? style.popupUp : style.popupDown, others.popupStyle]}>{content}</View>
      )}
    </View>
  );
};

Popup.propTypes = {
  children: PropTypes.node,
  content: PropTypes.node,
  isOpen: PropTypes.bool,
};

export { Popup };
