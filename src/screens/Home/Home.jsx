import { Button, Card, Icon, ScrollView, Screen, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { CardAction, VaultItem } from './components';
import { style } from './Home.style';
import { getFavorites, groupByVault } from './modules';
import { Header, SecretItem } from '../../components';
import { useStore } from '../../contexts';
import { ICON } from '../../modules';

const Home = ({ navigation }) => {
  const { session, secrets = [] } = useStore();

  const [search, setSearch] = useState();

  useEffect(() => {
    setSearch();
  }, [secrets]);

  useEffect(() => {
    setTimeout(() => {
      // navigation.navigate('create');
      // const { qr, name } = qrs[0];
      // navigation.navigate('viewer', { qrs: [qr], name });
    }, 10);
  }, []);

  const favorites = getFavorites(secrets);
  const vaults = groupByVault(secrets);

  const [lastViewedSecret] = (secrets.length && secrets.sort((a, b) => b.readAt - a.readAt)) || [];

  return (
    <Screen disableScroll style={style.screen}>
      <Header {...{ navigation }} showPremium showSettings />

      <ScrollView style={style.scrollview}>
        <View row spaceBetween style={[style.section, style.cardActions]}>
          <CardAction
            color="accent"
            icon={ICON.SCAN}
            text="Scan Secret"
            tiny="Add an external SecretQR to become a guardian."
            onPress={() => navigation.navigate('scanner')}
          />
          {secrets.length ? (
            <CardAction
              caption="Last used"
              icon={ICON[lastViewedSecret.vault]}
              text={lastViewedSecret.name}
              tiny={new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(lastViewedSecret.readAt)}
              onPress={() => navigation.navigate('viewer', lastViewedSecret)}
            />
          ) : (
            <CardAction
              icon={ICON.ADD}
              text="First secret"
              tiny="Create your first secret"
              onPress={() => navigation.navigate('create')}
            />
          )}
        </View>
        {!session?.subscription?.productIdentifier && (
          <Card gap style={style.section}>
            <View row>
              <Text caption>What's new</Text>
              <Icon name={ICON.ADD} />
            </View>

            <Text bold secondary title style={{ maxWidth: '55%' }}>
              New features in SecretQR
            </Text>

            <Text caption color="contentLight">
              Explore the new features that make SecretQR much better.
            </Text>
          </Card>
        )}

        <Text bold caption secondary style={style.caption}>
          My Vaults
        </Text>
        <View horizontal row style={[style.vaults, style.section]}>
          {Object.entries(vaults).map(([type, secrets = []]) => (
            <VaultItem
              key={type}
              {...{ type, secrets }}
              onPress={() => navigation.navigate('vault', { type, secrets })}
            />
          ))}
        </View>

        {favorites.length > 0 && (
          <>
            <Text bold caption secondary style={style.caption}>
              Favorites
            </Text>
            {favorites.map((secret = {}) => (
              <SecretItem
                key={secret.hash}
                {...secret}
                onPress={() => navigation.navigate('viewer', { ...secret, qrs: [secret.value], readMode: true })}
              />
            ))}
          </>
        )}
      </ScrollView>

      <Button icon={ICON.SCAN} large secondary onPress={() => navigation.navigate('scanner')} style={style.buttonAdd} />
    </Screen>
  );
};

Home.propTypes = {
  navigation: PropTypes.any,
};

export { Home };
