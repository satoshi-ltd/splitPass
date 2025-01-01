import { Input, Screen, View, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Vault.style';
import { SecretItem } from '../../components';
import { useStore } from '../../contexts';

const Vault = ({ navigation, route: { params: { type } = {} } }) => {
  const { secrets = [] } = useStore();
  return (
    <Screen gap style={style.screen}>
      {/* ! TODO */}
      <Input disabled placeholder="Search..." type="search" />

      <View>
        <Text bold caption secondary>
          {type}
        </Text>
        {secrets
          .filter((item) => item.vault === type)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((secret = {}) => (
            <SecretItem
              key={secret.hash}
              {...secret}
              onPress={() => navigation.navigate('viewer', { ...secret, values: [secret.value], readMode: true })}
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
