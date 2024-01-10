import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import QRCodeStyled from 'react-native-qrcode-styled';

import { View } from '../../__primitives__';

const QR = ({ rounded = true, size = 128, value = '', ...others }) => {
  const pieceSize = size / 32;
  const borderRadius = rounded ? pieceSize / 2 : undefined;

  return (
    <View {...others}>
      <QRCodeStyled
        color={StyleSheet.value('$qrColor')}
        data={value}
        isPiecesGlued={true}
        padding={pieceSize * 2}
        pieceBorderRadius={borderRadius}
        pieceCornerType={rounded ? 'rounded' : undefined}
        pieceSize={pieceSize}
        style={{
          backgroundColor: StyleSheet.value('$qrBackgroundColor'),
          borderRadius,
        }}
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
