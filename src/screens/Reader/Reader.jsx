import { useFocusEffect } from '@react-navigation/native';
import { Action, Button, Text, View } from '@satoshi-ltd/nano-design';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { style } from './Reader.style';

const Reader = ({ navigation: { goBack } }) => {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState();

  const [permission, requestPermission] = useCameraPermissions();

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      if (!permission?.granted) return requestPermission();

      return () => setActive(false);
    }, []),
  );

  const handleBarcodeScanned = ({ data }) => {
    setValue(data);
  };

  const handleSubmit = () => {
    alert(value);
  };

  const handleBack = () => {
    setActive(false);
    goBack();
  };

  return (
    <>
      {permission?.granted ? (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          facing="back"
          onBarcodeScanned={value ? undefined : handleBarcodeScanned}
          onCameraReady={() => console.log('::onCameraReady')}
          style={style.scanner}
        />
      ) : (
        <View style={style.scanner} />
      )}
      <View style={style.screen}>
        <View style={[style.section, style.header]}>
          <Text align="center" bold subtitle style={style.text}>
            Scan QR Code
          </Text>
        </View>

        <View row wide>
          <View style={style.section} wide />

          <View style={style.frame}>
            <View style={[style.corner, style.topLeft]} />
            <View style={[style.corner, style.topRight]} />
            <View style={[style.corner, style.bottomLeft]} />
            <View style={[style.corner, style.bottomRight]} />
          </View>

          <View style={style.section} wide />
        </View>

        <View spaceBetween style={[style.section, style.footer]}>
          <Text align="center" caption={!value} style={style.text}>
            {value ? 'Scan completed' : 'Place QR code inside the box'}
          </Text>

          {value && (
            <Button wide onPress={handleSubmit}>
              Import
            </Button>
          )}

          <View row spaceBetween>
            <Action disabled={!value} onPress={value ? () => setValue() : undefined}>
              Restart
            </Action>
            <Action onPress={handleBack}>Cancel</Action>
          </View>
        </View>
      </View>
    </>
  );
};

Reader.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Reader };
