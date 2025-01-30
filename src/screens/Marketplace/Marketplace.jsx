import { Screen } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { WebView } from 'react-native-webview';

import { style } from './Marketplace.style';

const Marketplace = () => {
  return (
    <Screen disableScroll gap style={style.screen}>
      <WebView style={style.container} source={{ uri: 'https://splitpass-marketplace.pages.dev/' }} />
    </Screen>
  );
};

Marketplace.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Marketplace };
