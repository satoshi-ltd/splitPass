import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Scanner.style';
import { NFCCard } from '../../components';

const ScannerNFC = ({ scanning = false, onRead = () => {}, onTag, reveal }) => (
  <View align="center" style={[style.background, style.scannerNFC]}>
    <NFCCard active={scanning} readMode onRecord={onRead} onRead={onTag} />

    {reveal && (
      <View align="center" style={style.reveal}>
        <Text align="center" bold caption color={StyleSheet.value('$qrBackgroundColor')}>
          {reveal}
        </Text>
      </View>
    )}
  </View>
);

ScannerNFC.propTypes = {
  reveal: PropTypes.string,
  scanning: PropTypes.bool,
  onRead: PropTypes.func,
  onTag: PropTypes.func,
};

export { ScannerNFC };
