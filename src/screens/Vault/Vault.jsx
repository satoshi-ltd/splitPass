import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { style } from './Vault.style';
import { SecretItem } from '../../components';
import { useStore } from '../../contexts';
import { Icon, Input, Pressable, Screen, Text, View } from '../../design-system';
import { getSecretRiskMap, getVaultLabel, ICON, L10N } from '../../modules';

const serializeRouteDate = (value) =>
  value && typeof value === 'object' && typeof value.toISOString === 'function' ? value.toISOString() : value;

const Vault = ({ navigation, route: { params: { type } = {} } }) => {
  const { secrets = [] } = useStore();
  const secretRiskMap = useMemo(() => getSecretRiskMap(secrets), [secrets]);

  const [search, setSearch] = useState();

  return (
    <Screen gap style={style.screen}>
      <Input
        actions={
          search ? (
            <Pressable onPress={() => setSearch('')} style={style.clearButton}>
              <Icon name={ICON.CLOSE} size="s" tone="secondary" />
            </Pressable>
          ) : null
        }
        placeholder={L10N.SEARCH}
        value={search}
        onChange={setSearch}
        style={style.input}
      />

      <View>
        <Text bold size="l" tone="secondary">
          {getVaultLabel(type)}
        </Text>
        {secrets
          .filter(
            ({ name = '', username = '', vault }) =>
              vault === type && (!search || `${name} ${username}`.toLowerCase().includes(search.toLowerCase())),
          )
          .sort((a, b) => a.name.localeCompare(b.name) || (a.username || '').localeCompare(b.username || ''))
          .map((secret = {}) => (
            <SecretItem
              key={secret.hash}
              {...secret}
              isMediocre={!!secretRiskMap?.[secret.hash]?.isMediocre}
              isRepeated={!!secretRiskMap?.[secret.hash]?.isRepeated}
              onPress={() =>
                navigation.navigate('secret', {
                  brand: secret.brand,
                  favorite: secret.favorite,
                  hash: secret.hash,
                  kind: secret.kind,
                  name: secret.name,
                  readAt: serializeRouteDate(secret.readAt),
                  readMode: true,
                  username: secret.username,
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
