import { Screen, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './SplitCard.style';
import { CardOption, NFCCard } from '../../components';
import { ICON, L10N } from '../../modules';

const SplitCard = ({ navigation, route: { params: { writeMode } = {} } }) => {
  const [active, setActive] = useState(false);
  const [tag, setTag] = useState(false);

  const handleError = () => {
    setActive(false);
  };

  const handleRead = (tag) => {
    setTag(tag);
  };

  const handleRecord = (record) => {
    console.log('::handleRecord::', record);
  };

  const handleScan = () => {
    setActive(false);
    setTag();
    setTimeout(() => setActive(true), 400);
  };

  return (
    <Screen disableScroll gap style={style.screen}>
      <NFCCard {...{ active, writeMode }} onError={handleError} onRead={handleRead} onRecord={handleRecord} />

      <View style={style.footer}>
        <View row gap>
          <CardOption icon={ICON.SHOPPING} text={L10N.GET_SPLITCARD} onPress={navigation.goBack} />
          <CardOption
            color="accent"
            icon={ICON.NFC}
            text={active && !tag ? L10N.SCANNING : tag ? L10N.RESCAN : L10N.START_SCAN}
            onPress={handleScan}
          />
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
