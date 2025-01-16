import { Modal } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { SubscriptionCurrent as Current } from './Subscription.Current';
import { SubscriptionOptions as Options } from './Subscription.Options';
import { style } from './Subscription.style';
import { useStore } from '../../contexts';

const Subscription = ({ route, navigation = {} }) => {
  const { subscription } = useStore();

  const suscribed = !!subscription?.productIdentifier;

  return (
    <Modal gap onClose={navigation.goBack} style={style.modal}>
      {suscribed ? <Current {...{ route, navigation }} /> : <Options {...{ route, navigation }} />}
    </Modal>
  );
};

Subscription.displayName = 'Subscription';

Subscription.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Subscription };
