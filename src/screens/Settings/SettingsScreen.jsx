import React from 'react';

import { style } from './SettingsScreen.style';
import { Text, View } from '../../__primitives__';

export const SettingsScreen = () => {
  return (
    <View style={style.screen}>
      <Text bold subtitle>
        /settings
      </Text>
    </View>
  );
};
