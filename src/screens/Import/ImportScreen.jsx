import { useFocusEffect } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';

import { style } from './ImportScreen.style';
import { Button, Pressable, Text, View } from '../../__primitives__';

// eslint-disable-next-line react/prop-types
export const ImportScreen = ({ route: { params: { type } = {} }, navigation: { goBack } }) => {
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
      <SafeAreaView style={style.screen}>
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
            <Pressable onPress={value ? () => setValue() : undefined}>
              <Text bold style={[style.text, !value && style.textDisabled]}>
                Restart
              </Text>
            </Pressable>
            <Pressable onPress={() => goBack()}>
              <Text bold style={style.text}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};
