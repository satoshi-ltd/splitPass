import { Screen, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { style } from './SplitCard.style';
import { CardMarketplace, NFCCard } from '../../components';

const SplitCard = ({ navigation = {}, route: { params: { writeMode, viewer } = {} } }) => {
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();
      navigation.dispatch(event.data.action);

      if (viewer) navigation.navigate('viewer', viewer);
    });

    return unsubscribe;
  }, [navigation, viewer]);

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
