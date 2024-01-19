import React from 'react';

import { Text } from './__primitives__';

const GUARDIANS = [1, 3, 5];

const QR_TYPE = {
  PASSWORD: '1',
  PASSWORD_ENCRYPTED: '2',
  SEED_PHRASE: '3',
  SEED_PHRASE_ENCRYPTED: '4',
};

const OPTIONS = {
  MODAL: {
    cardOverlayEnabled: true,
    gestureEnabled: true,
    headerShown: false,
    presentation: 'modal',
  },

  SCREEN: {
    headerShown: false,
  },

  TAB: {
    headerShown: false,
    headerTitle: (props) => <Text bold caption {...props} color="contentLight" />,
  },
};

export { GUARDIANS, QR_TYPE, OPTIONS };
