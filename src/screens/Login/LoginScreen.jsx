import React from 'react';

import { style } from './LoginScreen.style';
import { Button, Text, ScrollView } from '../../__primitives__';

// eslint-disable-next-line react/prop-types
export const LoginScreen = ({ navigation: { navigate } }) => {
  return (
    <ScrollView style={style.screen}>
      <Text bold subtitle>
        /Vault
      </Text>
      <Button onPress={() => navigate('main')}>faceId</Button>
    </ScrollView>
  );
};
