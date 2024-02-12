import { useFocusEffect } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './ImportScreen.style';
import { Action, Button, Text, View } from '../../__nano-design__';

const ImportScreen = ({ navigation: { goBack } }) => {
  const [hasPermission, setHasPermission] = useState(false);
  // const [scanned, setScanned] = useState(false);
  const [value, setValue] = useState();

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        setValue();
      })();

      return () => setHasPermission(false);
    }, []),
  );

  const handleBarCodeScanned = ({ data }) => {
    // ! TODO: decode(qr)
    setValue(data);
  };

  const handleSubmit = () => {
    alert(value);
  };

  return (
    <>
      {hasPermission ? (
        <BarCodeScanner onBarCodeScanned={value ? undefined : handleBarCodeScanned} style={style.scanner} />
      ) : (
        <View style={style.scanner} />
      )}
      <View style={style.screen}>
        <View style={[style.section, style.header]}>
          <Text align="center" bold subtitle style={style.text}>
            Scan QR Code
          </Text>
        </View>

        <View row>
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
            <Action onPress={() => goBack()}>Cancel</Action>
          </View>
        </View>
      </View>
    </>
  );
};

ImportScreen.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { ImportScreen };
