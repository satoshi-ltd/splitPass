import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import QRCodeStyled from 'react-native-qrcode-styled';

import { style } from './Qr.style';
import { View } from '../../__primitives__';

const QR = React.forwardRef(({ inline = false, rounded = true, size = 128, value = '', ...others }, ref) => {
  const { length = 1 } = value;
  const pieceSize = parseInt((size / (length >= 96 ? 42 : length >= 48 ? 34 : 28)) * (inline ? 1.5 : 1));

  return (
    <View
      {...others}
      ref={ref}
      style={[style.container, inline ? style.inline : style.solid, { height: size, width: size }, others.className]}
    >
      <QRCodeStyled
        color={inline ? StyleSheet.value('$qrBackgroundColor') : StyleSheet.value('$qrColor')}
        data={value}
        isPiecesGlued={rounded}
        padding={inline ? 0 : pieceSize * 2}
        pieceBorderRadius={rounded ? parseInt(pieceSize / 2) : undefined}
        pieceCornerType={rounded ? 'rounded' : undefined}
        pieceSize={pieceSize}
      />
    </View>
  );
});

QR.displayName = 'QR';

QR.propTypes = {
  inline: PropTypes.bool,
  rounded: PropTypes.bool,
  size: PropTypes.number,
  value: PropTypes.string,
};

export { QR };
