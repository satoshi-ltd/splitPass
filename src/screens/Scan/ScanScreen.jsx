import React from 'react';

import { Button, Text, View } from '../../__primitives__';
import { Card, Screen } from '../../components';

// eslint-disable-next-line react/prop-types
export const ScanScreen = ({ navigation: { navigate } }) => {
  return (
    <Screen>
      <Card>
        <View gap row spaceBetween>
          <View>
            <Text bold subtitle>
              Become a Guardian
            </Text>
            <Text caption>Add a QR code to become a guardian of a Secret</Text>
          </View>
        </View>
        <Button wide onPress={() => navigate('import', { type: 'QR' })}>
          Add via a QR Code
        </Button>
        <Button secondary wide onPress={() => navigate('import', { type: 'text' })}>
          Add via a Text Code
        </Button>
      </Card>
    </Screen>
  );
};
