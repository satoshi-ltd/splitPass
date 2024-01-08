import React from 'react';

import { style } from './ScanScreen.style';
import { Button, ScrollView, Text } from '../../__primitives__';
import { Card } from '../../components';

// eslint-disable-next-line react/prop-types
export const ScanScreen = ({ navigation: { navigate } }) => {
  return (
    <ScrollView style={style.screen}>
      <Card>
        <Text bold subtitle>
          Become a Guardian
        </Text>
        <Text caption>Add a QR code to become a guardian of a Secret</Text>
        <Button wide onPress={() => navigate('import', { type: 'QR' })}>
          Add via a QR Code
        </Button>
        <Button secondary wide onPress={() => navigate('import', { type: 'text' })}>
          Add via a Text Code
        </Button>
      </Card>

      <Button onPress={() => navigate('generate', {})}>Create a new secret</Button>
    </ScrollView>
  );
};
