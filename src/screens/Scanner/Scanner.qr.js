import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import { Frame } from './components';
import { style } from './Scanner.style';
import { Button, Text, View } from '../../design-system';
import { L10N } from '../../modules';

const QR_FRAME_SIZE = 232;

const ScannerQR = ({ camera = false, frame = false, onRead, scanning, stageHeight = 0, verticalOffset = 0 }) => {
  const [permission, requestPermission] = useCameraPermissions();

  const [active, setActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      if (!permission?.granted) requestPermission();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const permissionBlocked = permission?.canAskAgain === false;
  const handlePermissionPress = () =>
    permissionBlocked && Linking.openSettings ? Linking.openSettings() : requestPermission();
  const availableMaskHeight = Math.max(0, stageHeight - QR_FRAME_SIZE);
  const baseMaskHeight = availableMaskHeight / 2;
  const clampedOffset = Math.min(Math.max(0, verticalOffset), baseMaskHeight);
  const topMaskHeight = Math.min(availableMaskHeight, Math.ceil(Math.max(0, baseMaskHeight - clampedOffset)));
  const bottomMaskHeight = Math.max(0, availableMaskHeight - topMaskHeight);

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
      {camera && !permission?.granted ? (
        <View align="center" style={style.permissionCard}>
          <View align="center" style={style.permissionContent}>
            <Text align="center" bold size="l" tone="onInverse">
              {permissionBlocked ? L10N.SCANNER_QR_PERMISSION_DENIED : L10N.SCANNER_QR_PERMISSION}
            </Text>
            <Text align="center" size="s" tone="onInverse" style={style.permissionCaption}>
              {permissionBlocked ? L10N.SCANNER_QR_PERMISSION_DENIED : L10N.SCANNER_QR_PERMISSION_CAPTION}
            </Text>
            <Button size="s" variant="outlined" onPress={handlePermissionPress}>
              {permissionBlocked ? L10N.SCANNER_QR_PERMISSION_SETTINGS : L10N.CONTINUE}
            </Button>
          </View>
        </View>
      ) : null}
      {frame ? (
        <View style={style.qrFrameStage}>
          <View style={[style.scannerMask, style.maskTop, stageHeight ? { flex: 0, height: topMaskHeight } : null]} />

          <View style={style.maskMiddle}>
            <View style={[style.scannerMask, style.maskSide]} />

            <Frame align="center" />

            <View style={[style.scannerMask, style.maskSide]} />
          </View>

          <View
            style={[style.scannerMask, style.maskBottom, stageHeight ? { flex: 0, height: bottomMaskHeight } : null]}
          />
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
  stageHeight: PropTypes.number,
  verticalOffset: PropTypes.number,
};

export { ScannerQR };
