import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView as NativeScrollView } from 'react-native';

import { style } from './ScrollView.style';

const ScrollView = ({ ...others }) => <NativeScrollView {...others} style={[style.scrollView, others.style]} />;

ScrollView.displayName = 'ScrollView';

ScrollView.propTypes = {
  snap: PropTypes.bool,
};

export { ScrollView };
