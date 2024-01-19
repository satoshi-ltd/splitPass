import PropTypes from 'prop-types';
import React from 'react';

import { Button, Text } from '../../__primitives__';
import { Screen } from '../../components';

const OnboardingScreen = ({ navigation: { navigate } }) => {
  return (
    <Screen>
      <Text bold subtitle>
        /Onboarding
      </Text>
      <Button onPress={() => navigate('main')}>Go to App</Button>
    </Screen>
  );
};

OnboardingScreen.propTypes = {
  navigation: PropTypes.any,
};

export { OnboardingScreen };
