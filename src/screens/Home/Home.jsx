import { Button, Card, Icon, ScrollView, Screen, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { CardAction, VaultItem } from './components';
import { style } from './Home.style';
import { getFavorites, groupByVault } from './modules';
import { EVENT } from '../../App.constants';
import { SecretItem } from '../../components';
import { useStore } from '../../contexts';
import { eventEmitter, ICON, L10N } from '../../modules';
import { PurchaseService } from '../../services';

const Home = ({ navigation }) => {
  const { subscription = {}, secrets = [] } = useStore();

  useEffect(() => {
    setTimeout(() => {
      // ? SHORTCUTS
      // const [secret] = secrets;
      // navigation.navigate('create', { ...secret, values: [secret.value], readMode: true });
      // navigation.navigate('viewer', { ...secret, values: [secret.value], readMode: true });
      // navigation.navigate('splitcard', { writeMode: secret });
    }, 10);
  }, []);

  const favorites = getFavorites(secrets);
  const vaults = groupByVault(secrets);
  const subtitleProps = { bold: true, secondary: true, subtitle: true };

  const [lastViewed] =
    (secrets.length && secrets.sort((a, b) => new Date(b.readAt || null) - new Date(a.readAt || null))) || [];

  const handleSubscription = () => {
    PurchaseService.getProducts()
      .then((plans) => {
        navigation.navigate('subscription', { plans });
      })
      .catch((error) => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error }));
  };

  // !TODO: We should determine if is a shard or not

  return (
    <Screen disableScroll style={style.screen}>
      <ScrollView contentContainerStyle={style.scrollviewContentContainer}>
        <View row spaceBetween style={[style.section, style.cardActions]}>
          <CardAction
            color="accent"
            icon={ICON.SCAN}
            text={L10N.SCAN_SECRET}
            tiny={L10N.SCAN_SECRET_CAPTION}
            onPress={() => navigation.navigate('scanner')}
          />
          {lastViewed ? (
            <CardAction
              caption="Last used"
              icon={ICON[lastViewed.vault]}
              text={lastViewed.name}
              tiny={new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(lastViewed.readAt)}
              onPress={() =>
                navigation.navigate('viewer', { ...lastViewed, values: [lastViewed.value], readMode: true })
              }
            />
          ) : (
            <CardAction
              icon={ICON.ADD}
              text={L10N.FIRST_SECRET}
              tiny={L10N.FIRST_SECRET_CAPTION}
              onPress={() => navigation.navigate('create')}
            />
          )}
        </View>

        {!subscription?.productIdentifier && (
          <Card onPress={handleSubscription} style={[style.banner, style.section]}>
            <View row>
              <Icon name={ICON.STAR} style={style.bannerIcon} />
              <Text bold caption>
                {L10N.BANNER_SUBSCRIPTION_CAPTION}
              </Text>
            </View>

            <Text bold title style={style.bannerText}>
              {L10N.BANNER_SUBSCRIPTION_TITLE}
            </Text>

            <Text caption color="contentLight" secondary style={style.bannerText}>
              {L10N.BANNER_SUBSCRIPTION_DESCRIPTION}
            </Text>
          </Card>
        )}

        <Text {...subtitleProps}>My Vaults</Text>
        <View horizontal row style={[style.vaults, style.section]}>
          {Object.entries(vaults).map(([type, secrets = []]) => (
            <VaultItem key={type} {...{ type, secrets }} onPress={() => navigation.navigate('vault', { type })} />
          ))}
        </View>

        {favorites.length > 0 && (
          <>
            <Text {...subtitleProps}>Favorites</Text>
            {favorites.map((secret = {}) => (
              <SecretItem
                key={secret.hash}
                {...secret}
                onPress={() => navigation.navigate('viewer', { ...secret, values: [secret.value], readMode: true })}
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
