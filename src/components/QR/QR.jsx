import { Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import QRCodeStyled from 'react-native-qrcode-styled';
import ViewShot from 'react-native-view-shot';

import { style } from './Qr.style';
import { QRParser } from '../../modules';

const QR = React.forwardRef(({ value = '', readMode = false, ...others }, ref) => {
  const [reveal, setReveal] = useState(false);

  const handlePressStart = () => setReveal(true);

  const handlePressEnd = () => setReveal(false);

  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 0.8 }}>
      <Pressable
        {...others}
        feedback={false}
        onTouchCancel={readMode ? handlePressEnd : undefined}
        onTouchEnd={readMode ? handlePressEnd : undefined}
        onTouchMove={readMode ? handlePressEnd : undefined}
        onTouchStart={readMode ? handlePressStart : undefined}
        style={[style.container, others.className]}
      >
        <QRCodeStyled
          color={StyleSheet.value('$qrColor')}
          data={value}
          isPiecesGlued
          pieceSize={8}
          pieceBorderRadius={4}
        />
        {reveal && (
          <View align="center" style={style.secret}>
            <Text align="center" bold caption>
              {QRParser.decode(value)}
            </Text>
          </View>
        )}
      </Pressable>
    </ViewShot>
  );
});

QR.displayName = 'QR';

QR.propTypes = {
  readMode: PropTypes.bool,
  value: PropTypes.string,
};

export { QR };
