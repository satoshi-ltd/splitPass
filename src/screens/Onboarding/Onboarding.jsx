import React from 'react';

import { style } from './Onboarding.style';
import { Button, Text, ScrollView } from '../../__primitives__';

// eslint-disable-next-line react/prop-types
export const OnboardingScreen = ({ navigation: { navigate } }) => {
  return (
    <ScrollView style={style.screen}>
      <Text bold subtitle>
        /Onboarding
      </Text>
      <Button onPress={() => navigate('main')}>Go to App</Button>
    </ScrollView>
  );
};
