import { Action, Button, Card, Pressable, Modal, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Linking } from 'react-native';

import { style } from './Subscription.style';
import { SATOSHI_URLS } from '../../App.constants';
import { Logo } from '../../components';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { PurchaseService } from '../../services';
import { verboseDate } from '../Settings/helpers';

const Subscription = ({ route: { params: { plans = [] } = {} } = {}, navigation: { goBack } = {} }) => {
  const { subscription, updateSubscription } = useStore();

  const [busy, setBusy] = useState(null);
  const [plan, setPlan] = useState(null);

  const isPremium = !!subscription?.productIdentifier;

  const handleChange = (id) => {
    setPlan(id);
  };

  const handleRestore = () => {
    setBusy('restore');
    PurchaseService.restore()
      .then((activeSubscription) => {
        if (activeSubscription) {
          updateSubscription(activeSubscription);
          alert(L10N.PURCHASE_RESTORED);
          goBack();
          setBusy(null);
        }
      })
      .catch((error) => alert(error));
  };

  const handleStart = () => {
    setBusy('purchase');
    const { data } = plans.find((p) => p.productId === plan) || {};
    PurchaseService.buy(data)
      .then((newSubscription) => {
        if (newSubscription) {
          updateSubscription(newSubscription);
          goBack();
          setBusy(null);
        }
      })
      .catch((error) => alert(error));
  };

  const handleTermsAndConditions = () => {
    Linking.openURL(SATOSHI_URLS.TERMS);
  };

  const handlePrivacy = () => {
    Linking.openURL(SATOSHI_URLS.PRIVACY);
  };

  return (
    <Modal onClose={goBack} style={style.modal}>
      {isPremium ? (
        <>
          <View align="center">
            <Logo />
          </View>

          <View>
            <View gap row>
              <Text bold subtitle>
                {`${L10N.SUBSCRIPTION_ACTUAL_PLAN}: `}
              </Text>
              <Text subtitle>{subscription?.customerInfo?.entitlements?.active?.['pro']?.identifier}</Text>
            </View>
            <View gap row>
              <Text bold subtitle>
                {`${L10N.SUBSCRIPTION_NEXT_BILLING_DATE}: `}
              </Text>
              <Text subtitle>
                {subscription?.customerInfo?.entitlements?.active?.['pro']?.expirationDate
                  ? verboseDate(new Date(subscription?.customerInfo?.entitlements?.active?.['pro']?.expirationDate), {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : L10N.LIFETIME}
              </Text>
            </View>
          </View>

          <View style={style.buttons}>
            <Button outlined onPress={goBack}>
              {L10N.CLOSE}
            </Button>
          </View>
        </>
      ) : (
        <>
          <View align="center">
            <Logo />
            <Text align="center">{L10N.SUBSCRIPTION_CAPTION}</Text>
          </View>

          <View style={style.options}>
            <Text align="center" bold subtitle>
              {L10N.CHOOSE_PLAN}
            </Text>

            {plans.map(({ productId, price, title, description }) => (
              <Pressable key={productId} onPress={() => handleChange(productId)}>
                <Card outlined style={productId === plan ? style.optionHighlight : undefined}>
                  <View />
                  <Text bold color={productId === plan ? 'base' : undefined}>{`${price} / ${title}`}</Text>
                  {!!description && (
                    <Text color={productId === plan ? 'base' : undefined} tiny>
                      {description}
                    </Text>
                  )}
                </Card>
              </Pressable>
            ))}
          </View>

          <View style={style.buttons}>
            <Action activity={busy === 'restore'} color="content" onPress={handleRestore}>
              {L10N.RESTORE_PURCHASES}
            </Action>
            <Button activity={busy === 'purchase'} onPress={handleStart}>
              {plan === 'lifetime' ? L10N.PURCHASE : L10N.START_TRIAL}
            </Button>
            <Button outlined onPress={goBack}>
              {L10N.SUBSCRIPTION_CLOSE}
            </Button>
          </View>

          <Text tiny>
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
      )}
    </Modal>
  );
};

Subscription.displayName = 'Subscription';

Subscription.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Subscription };
