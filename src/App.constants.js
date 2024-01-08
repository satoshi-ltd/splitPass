import React from 'react';

import { Text } from './__primitives__';

const headerTitle = (props) => <Text bold caption {...props} color="contentLight" />;

const GUARDIANS = [1, 3, 5];

const MODAL_OPTIONS = {
  headerShown: true,
  headerTitle,
  presentation: 'modal',
};

const SCREEN_OPTIONS = {
  headerShown: false,
};

const TAB_OPTIONS = {
  headerShown: true,
  headerTitle,
};

export { GUARDIANS, MODAL_OPTIONS, SCREEN_OPTIONS, TAB_OPTIONS };
