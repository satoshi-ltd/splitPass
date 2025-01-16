import { Button, Card, Icon, Pressable, Tabs, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Linking } from 'react-native';

import { PLAN } from './Subscription.constants';
import { style } from './Subscription.style';
import { EVENT, SATOSHI_URLS } from '../../App.constants';
import { useStore } from '../../contexts';
import { eventEmitter, L10N } from '../../modules';
import { PurchaseService } from '../../services';

const SubscriptionOptions = ({ route: { params: { plans = [] } = {} } = {}, navigation: { goBack } = {} }) => {
  const { updateSubscription } = useStore();

  const [busy, setBusy] = useState(null);
  const [plan, setPlan] = useState(PLAN.SUBSCRIPTION);

  const handleStart = () => {
    setBusy('purchase');
    const { data } = plans[plan] || {};
    PurchaseService.buy(data)
      .then((newSubscription) => {
        if (newSubscription) {
          updateSubscription(newSubscription);
          goBack();
          setBusy(null);
        }
      })
      .catch(handleError);
  };

  const handleError = (error) => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, message: JSON.stringify(error) });

  const handleTermsAndConditions = () => {
    Linking.openURL(SATOSHI_URLS.TERMS);
  };

  const handlePrivacy = () => {
    Linking.openURL(SATOSHI_URLS.PRIVACY);
  };

  const isLifetime = plan === PLAN.LIFETIME;
  const planData = plans[plan];

  return (
    <>
      <View align="center">
        <Tabs
          accent={isLifetime}
          caption
          selected={isLifetime ? 1 : 0}
          options={[
            { id: PLAN.SUBSCRIPTION, text: L10N.SUBSCRIPTION },
            { id: PLAN.LIFETIME, text: L10N.LIFETIME },
          ]}
          onChange={(option) => setPlan(option.id)}
        />
      </View>

      <View style={style.title}>
        <Text bold title>
          {L10N.SUBSCRIPTION_TITLE}
        </Text>
        <Text bold caption color="contentLight">
          {isLifetime ? L10N.SUBSCRIPTION_LIFETIME_DESCRIPTION : L10N.SUBSCRIPTION_DESCRIPTION}
        </Text>
      </View>

      <Card gap style={style.items}>
        {L10N.SUBSCRIPTION_ITEMS.map(({ icon, description, title }, index) => (
          <View gap row key={`item-${index}`} style={style.item}>
            <Icon name={icon} title />
            <View flex>
              <Text caption bold>
                {title}
              </Text>
              <Text tiny color="contentLight">
                {description}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      <View align="center">
        {isLifetime ? (
          <Text align="center" bold caption style={style.lifetime}>
            {`${planData?.price || 'THB 3,990thb'} ${L10N.LIFETIME}`}
          </Text>
        ) : (
          <>
            <Text align="center" bold caption>
              {`${planData?.price || 'THB 3,990thb'} ${L10N.ANNUALY} (${planData?.pricePerMonth || 'THB 332.50'}/${
                L10N.MONTH
              })`}
            </Text>
            <Text align="center" bold caption>
              {L10N.CANCEL_ANYTIME}
            </Text>
          </>
        )}
      </View>

      <Button activity={busy === 'purchase'} secondary={isLifetime} onPress={handleStart}>
        {plan === PLAN.LIFETIME ? L10N.PURCHASE : L10N.START_TRIAL}
      </Button>

      <Text align="center" tiny>
        {L10N.SUBSCRIPTION_TERMS_CAPTION}
        {` `}
        <Pressable onPress={handleTermsAndConditions}>
          <Text bold tiny style={style.pressableTerms}>
            {L10N.SUBSCRIPTION_TERMS}
          </Text>
        </Pressable>
        {` ${L10N.SUBSCRIPTION_AND} `}
        <Pressable onPress={handlePrivacy}>
          <Text bold tiny style={style.pressableTerms}>
            {L10N.SUBSCRIPTION_PRIVACY}
          </Text>
        </Pressable>
        .
      </Text>
    </>
  );
};

SubscriptionOptions.displayName = 'SubscriptionOptions';

SubscriptionOptions.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { SubscriptionOptions };
