import PropTypes from 'prop-types';
import React from 'react';

import { Menu as MenuBase, Modal } from '../../design-system';

const Menu = ({ route: { params: { options = [] } = {} } = {}, navigation = {} }) => (
  <Modal onClose={navigation.goBack}>
    <MenuBase options={options} onClose={navigation.goBack} />
  </Modal>
);

Menu.displayName = 'Menu';

Menu.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Menu };
