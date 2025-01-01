import { View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import QRCodeStyled from 'react-native-qrcode-styled';
import ViewShot from 'react-native-view-shot';

import { style } from './Qr.style';

const QR = React.forwardRef(({ inline = false, rounded = true, size = 128, value = '', ...others }, ref) => {
  const { length = 1 } = value;
  // const pieceSize = parseInt((size / (length >= 96 ? 42 : length >= 48 ? 34 : 28)) * (inline ? 1.45 : 1));
  const pieceSize = parseInt((size / (length >= 96 ? 42 : length >= 48 ? 34 : 28)) * (inline ? 1.45 : 1));

  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 0.8 }}>
      <View {...others} style={[style.container, style.solid, { height: size, width: size }, others.className]}>
        <QRCodeStyled
          color={StyleSheet.value('$qrColor')}
          data={value}
          isPiecesGlued={rounded}
          padding={inline ? 0 : pieceSize * 2}
          pieceBorderRadius={rounded ? parseInt(pieceSize / 2) : undefined}
          pieceCornerType={rounded ? 'rounded' : undefined}
          pieceSize={pieceSize}
        />
      </View>
    </ViewShot>
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
