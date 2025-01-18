import { Input, Screen, View, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './Vault.style';
import { SecretItem } from '../../components';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';

const Vault = ({ navigation, route: { params: { type } = {} } }) => {
  const { secrets = [] } = useStore();

  const [search, setSearch] = useState();

  return (
    <Screen gap style={style.screen}>
      <Input placeholder={L10N.SEARCH} type="search" value={search} onChange={setSearch} style={style.input} />

      <View>
        <Text bold secondary subtitle>
          {type}
        </Text>
        {secrets
          .filter(({ name, vault }) => vault === type && (!search || name.includes(search)))
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
