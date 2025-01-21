import PropTypes from 'prop-types';
import React from 'react';

import { ICON, L10N } from '../../modules';
import { CardOption } from '../CardOption';

const CardMarketplace = ({ ...others }) => {
  return <CardOption {...others} icon={ICON.SHOPPING} text={L10N.GET_SPLITCARD} />;
};

CardMarketplace.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  squared: PropTypes.bool,
  text: PropTypes.string,
};

export { CardMarketplace };
