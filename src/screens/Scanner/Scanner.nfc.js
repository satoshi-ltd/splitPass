import PropTypes from 'react';
import React from 'react';

import { style } from './Scanner.style';
import { NFCCard } from '../../components';
import { View } from '../../design-system';

const ScannerNFC = ({ onRead = () => {}, onTag, writeMode = false }) => (
  <View align="center" style={style.scannerNFC}>
    <NFCCard readMode={!writeMode} showHeader={false} writeMode={writeMode} onRecord={onRead} onRead={onTag} />
  </View>
);

ScannerNFC.propTypes = {
  onRead: PropTypes.func,
  onTag: PropTypes.func,
  writeMode: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      name: PropTypes.string,
      notes: PropTypes.string,
      value: PropTypes.string,
      username: PropTypes.string,
    }),
  ]),
};

export { ScannerNFC };
