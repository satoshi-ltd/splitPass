import { Button, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Subscription.style';
import { Logo } from '../../components';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { verboseDate } from '../Settings/helpers';

const SubscriptionCurrent = ({ navigation = {} }) => {
  const { subscription } = useStore();

  return (
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
        <Button outlined onPress={navigation.goBack}>
          {L10N.CLOSE}
        </Button>
      </View>
    </>
  );
};

SubscriptionCurrent.displayName = 'SubscriptionCurrent';

SubscriptionCurrent.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { SubscriptionCurrent };
