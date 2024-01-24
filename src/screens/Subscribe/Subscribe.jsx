import PropTypes from 'prop-types';
import React from 'react';

import { Button, Screen, Text } from '../../__nano-design__';

const SubscribeScreen = ({ navigation: { navigate } }) => {
  return (
    <Screen>
      <Text bold subtitle>
        /Onboarding
      </Text>
      <Button onPress={() => navigate('main')}>Go to App</Button>
    </Screen>
  );
};

SubscribeScreen.propTypes = {
  navigation: PropTypes.any,
};

export { SubscribeScreen };
