import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import QRCodeStyled from 'react-native-qrcode-styled';

import { style } from './Qr.style';
import { View } from '../../__primitives__';

const QR = ({ rounded = true, size = 128, value = '', ...others }) => {
  const { length = 1 } = value;
  const pieceSize = parseInt(size / (length >= 96 ? 42 : length >= 48 ? 34 : 28));
  const borderRadius = rounded ? parseInt(pieceSize / 2) : undefined;

  return (
    <View {...others} style={[style.container, { height: size, width: size }, others.className]}>
      <QRCodeStyled
        color={StyleSheet.value('$qrColor')}
        data={value}
        isPiecesGlued={true}
        padding={pieceSize * 2}
        pieceBorderRadius={borderRadius}
        pieceCornerType={rounded ? 'rounded' : undefined}
        pieceSize={pieceSize}
        style={{ backgroundColor: StyleSheet.value('$qrBackgroundColor') }}
      />
    </View>
  );
};

QR.displayName = 'QR';

QR.propTypes = {
  rounded: PropTypes.bool,
  size: PropTypes.number,
  value: PropTypes.string,
};

export { QR };
