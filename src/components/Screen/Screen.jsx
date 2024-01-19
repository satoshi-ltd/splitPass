import PropTypes from 'prop-types';
import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';

import { style } from './Screen.style';
import { ScrollView, View } from '../../__primitives__';

const Screen = ({ ...others }) => (
  <SafeAreaView style={style.safeAreaView}>
    <ScrollView style={style.scrollView}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
        <View {...others} style={style.view} />
      </KeyboardAvoidingView>
    </ScrollView>
  </SafeAreaView>
);

Screen.displayName = 'Screen';

Screen.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  children: PropTypes.node,
  gap: PropTypes.bool,
  displayName: PropTypes.string,
  row: PropTypes.bool,
  wide: PropTypes.bool,
};

export { Screen };
