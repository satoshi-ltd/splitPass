import { Button, Card, Screen, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

const ScanScreen = ({ navigation: { navigate } }) => {
  return (
    <Screen gap offset>
      <View>
        <Text align="center" bold subtitle>
          Lorem ipsum dolor sit amet
        </Text>
        <Text align="center" caption>
          consectetur adipisicing elit. Doloribus omnis accusamus nostrum provident eveniet, sed cum tempore
        </Text>
      </View>

      <Card gap>
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

ScanScreen.propTypes = {
  navigation: PropTypes.any,
};

export { ScanScreen };
