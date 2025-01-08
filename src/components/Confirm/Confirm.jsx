import { Confirm as ConfirmBase } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { L10N } from '../../modules';

const Confirm = ({ route: { params: { onAccept = () => {}, ...params } = {} } = {}, navigation: { goBack } = {} }) => (
  <ConfirmBase
    accept={L10N.ACCEPT}
    cancel={L10N.CANCEL}
    {...params}
    onCancel={() => {
      goBack();
    }}
    onAccept={() => {
      goBack();
      onAccept();
    }}
  />
);

Confirm.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Confirm };
