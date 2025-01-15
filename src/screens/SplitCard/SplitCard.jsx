import { Screen, View, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './SplitCard.style';
import { NFCCard } from '../../components';
import { useStore } from '../../contexts';
import { ICON, L10N } from '../../modules';

// ! TODO: Refacto
import { CardOption } from '../Viewer/components';

const SplitCard = ({ navigation, route: { params: { writeMode } = {} } }) => {
  const { secrets = [] } = useStore();

  const [active, setActive] = useState(false);

  const handleSuccess = () => {
    setActive(false);
  };

  const handleScan = () => {
    setActive(false);
    setTimeout(() => {
      setActive(true);
    }, 400);
  };

  console.log({ writeMode });

  return (
    <Screen disableScroll gap style={style.screen}>
      <View align="center" style={style.header}>
        <Text align="center" bold secondary title style={[style.instructionsContent, style.text]}>
          {L10N.SCANNER_NFC_TITLE}
        </Text>
        <Text align="center" caption color="contentLight" style={style.instructionsContent}>
          {L10N.SCANNER_NFC_CAPTION}
        </Text>
      </View>

      <View align="center">
        <NFCCard
          {...{ active, writeMode }}
          //
          onError={() => setActive(false)}
          // onRead={() => setActive(false)}
          // onSuccess={handleSuccess}
        />
      </View>

      <View style={style.footer}>
        <View row gap>
          {/* <CardOption text="Close" onPress={navigation.goBack} /> */}
          <CardOption icon={ICON.SHOPPING} text="Get your own Split|Card" onPress={navigation.goBack} />
          <CardOption
            color="accent"
            // disabled={active}
            icon={ICON.NFC}
            text="Ready to Scan"
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
