import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './Create.totpScanner.style';
import { EVENT } from '../../App.constants';
import { Button, Text, View } from '../../design-system';
import { eventEmitter, isTOTPURI, L10N, parseTOTPURI } from '../../modules';

const CreateTotpScanner = ({ onRead }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleRead = ({ data = '' } = {}) => {
    if (!scanning) return;

    const parsed = isTOTPURI(data) ? parseTOTPURI(data) : undefined;
    if (!parsed) {
      setScanning(false);
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.TOTP_INVALID });
      setTimeout(() => setScanning(true), 1200);
      return;
    }

    setScanning(false);
    onRead?.({ secret: data, totp: parsed });
  };

  return (
    <View style={style.sheet}>
      <View style={style.cameraShell}>
        {permission?.granted ? (
          <>
            <CameraView
              autofocus="on"
              barcodeScannerSettings={{ barcodeTypes: ['qr'], isSupported: true }}
              facing="back"
              onBarcodeScanned={scanning ? handleRead : undefined}
              style={style.camera}
            />
            <View pointerEvents="none" style={style.frame} />
          </>
        ) : (
          <View style={style.cameraOverlay}>
            <View style={style.overlayCard}>
              <Text bold size="l" tone="onScrim">
                {L10N.OTP_QR_SCAN}
              </Text>
              <Text size="s" tone="onScrim">
                {L10N.SCANNER_QR_CAPTION}
              </Text>
              <Button onPress={() => requestPermission()} size="l" style={style.button} variant="primary">
                {L10N.OTP_QR_SCAN}
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

CreateTotpScanner.propTypes = {
  onRead: PropTypes.func,
};

export { CreateTotpScanner };
