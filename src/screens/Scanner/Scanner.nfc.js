import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Frame } from './components';
import { style } from './Scanner.style';
import { NFCCard } from '../../components';

const ScannerNFC = ({ onRead = () => {}, onTag, reveal }) => (
  <View align="center" style={[style.background, style.scannerNFC]}>
    <NFCCard readMode onRecord={onRead} onRead={onTag} />

    {reveal && (
      <Frame align="center" card style={style.revealNFC}>
        <Text align="center" bold color={StyleSheet.value('$colorLight')} secondary>
          {reveal}
        </Text>
      </Frame>
    )}
  </View>
);

ScannerNFC.propTypes = {
  reveal: PropTypes.string,
  onRead: PropTypes.func,
  onTag: PropTypes.func,
};

export { ScannerNFC };
