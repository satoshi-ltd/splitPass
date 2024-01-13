import React from 'react';

import { Text } from './__primitives__';

const headerTitle = (props) => <Text bold caption {...props} color="contentLight" />;

const GUARDIANS = [1, 3, 5];

const QR_TYPE = {
  PASSWORD: '1',
  PASSWORD_ENCRYPTED: '2',
  SEED_PHRASE: '3',
  SEED_PHRASE_ENCRYPTED: '4',
};

const OPTIONS = {
  MODAL: {
    headerShown: true,
    headerTitle,
    presentation: 'modal',
    cardStyle: { backgroundColor: 'transparent' },
  },

  SCREEN: {
    headerShown: false,
  },

  TAB: {
    headerShown: true,
    headerTitle,
  },
};

export { GUARDIANS, QR_TYPE, OPTIONS };
