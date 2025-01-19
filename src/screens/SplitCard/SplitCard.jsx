import { Screen, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './SplitCard.style';
import { CardMarketplace, NFCCard } from '../../components';

const SplitCard = ({ route: { params: { writeMode } = {} } }) => {
  return (
    <Screen disableScroll gap style={style.screen}>
      <NFCCard {...{ writeMode }} />

      <View style={style.footer}>
        <View>
          <CardMarketplace />
        </View>
      </View>
    </Screen>
  );
};

SplitCard.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { SplitCard };
