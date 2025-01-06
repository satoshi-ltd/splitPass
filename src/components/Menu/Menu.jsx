import { Menu as MenuBase } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

const Menu = ({ route: { params: { options = [] } = {} } = {}, navigation = {} }) => (
  <MenuBase options={options} onClose={navigation.goBack} />
);

Menu.displayName = 'Menu';

Menu.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Menu };
