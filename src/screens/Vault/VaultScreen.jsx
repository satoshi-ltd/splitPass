import React from 'react';

import { style } from './VaultScreen.style';
import { Text, View } from '../../__primitives__';

export const VaultScreen = () => {
  return (
    <View style={style.screen}>
      <Text bold subtitle>
        /Vault
      </Text>
    </View>
  );
};
