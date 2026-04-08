import PropTypes from 'prop-types';
import QRCode from 'qrcode';
import React, { useMemo } from 'react';
import QRCodeStyled from 'react-native-qrcode-styled';
import ViewShot from 'react-native-view-shot';

import { calculatePieceSize } from './helpers/calculatePieceSize';
import { style } from './Qr.style';
import { useApp } from '../../contexts';
import { View } from '../../design-system';

const QR = React.forwardRef(
  (
    { backgroundColor, className, containerStyle, foregroundColor, pieceBorderRadius = 4, size, value = '', ...others },
    ref,
  ) => {
    const { colors } = useApp();
    const defaultPieceSize = calculatePieceSize(value);
    const qrCodeSize = useMemo(() => {
      if (!size || !value) return undefined;

      try {
        return QRCode.create(value, { errorCorrectionLevel: 'M' })?.modules?.size;
      } catch {
        return undefined;
      }
    }, [size, value]);

    const resolvedPieceSize = useMemo(() => {
      if (!size || !qrCodeSize) return defaultPieceSize;

      const availableSize = Math.max(size, qrCodeSize);
      return Math.max(2, Math.min(defaultPieceSize, Math.floor(availableSize / qrCodeSize)));
    }, [defaultPieceSize, qrCodeSize, size]);
    const rawQrSize = qrCodeSize ? resolvedPieceSize * qrCodeSize : undefined;
    const dimensionProps =
      size && rawQrSize
        ? {
            height: size,
            viewBox: `0 0 ${rawQrSize} ${rawQrSize}`,
            width: size,
          }
        : null;

    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
        <View {...others} style={[style.container, containerStyle, className]}>
          <QRCodeStyled
            backgroundColor={backgroundColor || colors.qrBackground}
            color={foregroundColor || colors.qrForeground}
            data={value}
            isPiecesGlued
            {...dimensionProps}
            pieceBorderRadius={pieceBorderRadius}
            pieceSize={resolvedPieceSize}
          />
        </View>
      </ViewShot>
    );
  },
);

QR.displayName = 'QR';

QR.propTypes = {
  backgroundColor: PropTypes.string,
  containerStyle: PropTypes.any,
  foregroundColor: PropTypes.string,
  pieceBorderRadius: PropTypes.number,
  size: PropTypes.number,
  value: PropTypes.string,
};

export { QR };
