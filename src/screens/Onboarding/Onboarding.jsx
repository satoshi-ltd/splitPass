import React from 'react';

import { Button, Text } from '../../__primitives__';
import { Screen } from '../../components';

// eslint-disable-next-line react/prop-types
export const OnboardingScreen = ({ navigation: { navigate } }) => {
  return (
    <Screen>
      <Text bold subtitle>
        /Onboarding
      </Text>
      <Button onPress={() => navigate('main')}>Go to App</Button>
    </Screen>
  );
};
