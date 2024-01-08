import PropTypes from 'prop-types';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView as NativeScrollView } from 'react-native';

import { style } from './ScrollView.style';
import { View } from '../View';

const ScrollView = ({ ...others }) => (
  <NativeScrollView style={style.scrollView}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
      <View {...others} />
    </KeyboardAvoidingView>
  </NativeScrollView>
);

ScrollView.displayName = 'ScrollView';

ScrollView.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  children: PropTypes.node,
  gap: PropTypes.bool,
  displayName: PropTypes.string,
  row: PropTypes.bool,
  wide: PropTypes.bool,
};

export { ScrollView };
