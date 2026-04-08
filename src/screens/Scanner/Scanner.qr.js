import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import { Frame } from './components';
import { style } from './Scanner.style';
import { Button, Text, View } from '../../design-system';
import { L10N } from '../../modules';

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

  const permissionBlocked = permission?.canAskAgain === false;
  const handlePermissionPress = () =>
    permissionBlocked && Linking.openSettings ? Linking.openSettings() : requestPermission();

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
