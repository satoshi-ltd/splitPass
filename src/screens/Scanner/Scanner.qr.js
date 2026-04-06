import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'react';
import React, { useCallback, useState } from 'react';

import { Frame } from './components';
import { style } from './Scanner.style';
import { View } from '../../design-system';
const ScannerQR = ({ camera = false, frame = false, onRead, scanning }) => {
  const [permission, requestPermission] = useCameraPermissions();

  const [active, setActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      if (!permission?.granted) requestPermission();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <>
      {camera && permission?.granted && (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'], isSupported: true }}
          facing="back"
          onBarcodeScanned={scanning ? ({ data = '' }) => onRead(data) : undefined}
          style={style.camera}
        />
      )}
      {frame ? (
        <View style={style.qrFrameStage}>
          <View style={[style.scannerMask, style.maskTop]} />

          <View style={style.maskMiddle}>
            <View style={[style.scannerMask, style.maskSide, style.maskSideLeft]} />

            <Frame align="center" />

            <View style={[style.scannerMask, style.maskSide, style.maskSideRight]} />
          </View>

          <View style={[style.scannerMask, style.maskBottom]} />
        </View>
      ) : null}
    </>
  );
};

ScannerQR.propTypes = {
  camera: PropTypes.bool,
  frame: PropTypes.bool,
  onRead: PropTypes.func,
  scanning: PropTypes.bool,
};

export { ScannerQR };
