import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './Vault.style';
import { SecretItem } from '../../components';
import { useStore } from '../../contexts';
import { Input, Screen, Text, View } from '../../design-system';
import { getVaultLabel, L10N } from '../../modules';

const serializeRouteDate = (value) =>
  value && typeof value === 'object' && typeof value.toISOString === 'function' ? value.toISOString() : value;

const Vault = ({ navigation, route: { params: { type } = {} } }) => {
  const { secrets = [] } = useStore();

  const [search, setSearch] = useState();

  return (
    <Screen gap style={style.screen}>
      <Input placeholder={L10N.SEARCH} value={search} onChange={setSearch} style={style.input} />

      <View>
        <Text bold size="l" tone="secondary">
          {getVaultLabel(type)}
        </Text>
        {secrets
          .filter(({ name, vault }) => vault === type && (!search || name.includes(search)))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((secret = {}) => (
            <SecretItem
              key={secret.hash}
              {...secret}
              onPress={() =>
                navigation.navigate('secret', {
                  brand: secret.brand,
                  favorite: secret.favorite,
                  hash: secret.hash,
                  kind: secret.kind,
                  name: secret.name,
                  readAt: serializeRouteDate(secret.readAt),
                  readMode: true,
                  website: secret.website,
                  values: [secret.value],
                })
              }
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
