import { Input, Screen, View, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Vault.style';
import { Header, SecretItem } from '../../components';

const Vault = ({ navigation, route: { params: { type, secrets } = {} } }) => {
  return (
    <Screen gap style={style.screen}>
      <Header {...{ navigation }} onBack={navigation.goBack} />

      {/* ! TODO */}
      <Input disabled placeholder="Search..." type="search" />

      <View>
        <Text bold caption secondary>
          {type}
        </Text>
        {secrets.map((secret = {}) => (
          <SecretItem
            key={secret.hash}
            {...secret}
            onPress={() => navigation.navigate('viewer', { ...secret, qrs: [secret.value], readMode: true })}
          />
        ))}
      </View>
    </Screen>
  );
};

Vault.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Vault };
