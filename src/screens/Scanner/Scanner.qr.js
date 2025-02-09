import { useFocusEffect } from '@react-navigation/native';
import { Text, View } from '@satoshi-ltd/nano-design';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Frame } from './components';
import { style } from './Scanner.style';
import { L10N } from '../../modules';

const ScannerQR = ({ is, onRead, reveal, scanning }) => {
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
      {permission?.granted && !is.modeNFC && (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'], isSupported: true }}
          facing="back"
          onBarcodeScanned={scanning ? ({ data = '' }) => onRead(data) : undefined}
          style={style.camera}
        />
      )}
      <View style={[style.instructions, style.background]}>
        <Text align="center" bold secondary title style={[style.instructionsContent, style.text]}>
          {L10N.SCANNER_QR}
        </Text>
        <Text align="center" caption color="contentLight" style={style.instructionsContent}>
          {L10N.SCANNER_QR_CAPTION}
        </Text>
      </View>

      <View row wide>
        <View style={[style.section, style.background]} wide />

        <Frame align="center">
          {reveal && (
            <Text align="center" bold color={StyleSheet.value('$qrBackgroundColor')} secondary>
              {reveal}
            </Text>
          )}
        </Frame>

        <View style={[style.section, style.background]} wide />
      </View>
    </>
  );
};

ScannerQR.propTypes = {
  is: PropTypes.shape({
    modeNFC: PropTypes.bool,
  }),
  onRead: PropTypes.func,
  reveal: PropTypes.string,
  scanning: PropTypes.bool,
};

export { ScannerQR };
