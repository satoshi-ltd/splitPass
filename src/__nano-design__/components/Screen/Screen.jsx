import PropTypes from 'prop-types';
import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';

import { style } from './Screen.style';
import { ScrollView, View } from '../../primitives';

const Screen = ({ modal = false, ...others }) => (
  <SafeAreaView style={style.safeAreaView}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
      <ScrollView style={style.scrollView}>
        <View {...others} style={[modal ? style.modal : undefined, others.style]} />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

Screen.displayName = 'Screen';

Screen.propTypes = {
  // align: PropTypes.oneOf(['left', 'center', 'right']),
  children: PropTypes.node,
  // gap: PropTypes.bool,
  modal: PropTypes.bool,
  // row: PropTypes.bool,
};

export { Screen };
