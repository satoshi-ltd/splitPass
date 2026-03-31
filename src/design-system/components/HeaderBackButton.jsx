import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { ICON } from '../../modules';
import { theme } from '../../theme';
import Icon from '../primitives/Icon';
import Pressable from '../primitives/Pressable';

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});

const HeaderBackButton = ({ onPress, style, tone = 'primary' }) => {
  return (
    <Pressable onPress={onPress} style={[styles.base, style]}>
      <Icon name={ICON.BACK} size="l" tone={tone} />
    </Pressable>
  );
};

HeaderBackButton.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.any,
  tone: PropTypes.oneOf(['primary', 'secondary', 'accent', 'onAccent', 'onInverse', 'danger']),
};

export default HeaderBackButton;
