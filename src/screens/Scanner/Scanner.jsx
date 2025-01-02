import { useFocusEffect } from '@react-navigation/native';
import { Action, Button, Card, Pressable, Input, Text, Modal, View } from '@satoshi-ltd/nano-design';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, useWindowDimensions } from 'react-native';

import { style } from './Scanner.style';
import { QR_TYPE } from '../../App.constants';
import { ICON, QRParser } from '../../modules';
import { CardOption } from '../Viewer/components';

const { PASSWORD_SHARD, SEED_PHRASE_SHARD } = QR_TYPE;

const SECURE_TYPES = [QR_TYPE.PASSWORD_SECURE, QR_TYPE.SEED_PHRASE_SECURE];
const qrTypes = Object.values(QR_TYPE);

const Scanner = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();

  const [active, setActive] = useState(false);
  const [form, setForm] = useState({});
  const [passcode, setPasscode] = useState();
  const [valid, setValid] = useState(false);
  const [values, setValues] = useState([]);
  const [reveal, setReveal] = useState(false);

  // const [shard, setShard] = useState();

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      setValid(false);
      setValues([]);
      setReveal(false);

      // !TODO
      handleBarcodeScanned();
      // if (!permission?.granted) return requestPermission();

      return () => setActive(false);
    }, []),
  );

  const handleBarcodeScanned = ({
    data = '5071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149',
  } = {}) => {
    const [type] = data;

    if (!qrTypes.includes(type)) return;
    if ([PASSWORD_SHARD, SEED_PHRASE_SHARD].includes(type)) return alert('read next shard');

    // ! TODO: Should check if is a valid SecretQR
    setValues([...values, data]);
    // setValue(data);
    setValid(true);
  };

  const handleReset = () => setValues([]);

  const handleImport = () => {};

  const handleSave = () => {
    // alert(value);
  };

  const handleBack = () => {
    setActive(false);
    navigation.goBack();
  };

  const hasValue = values.length > 0;
  const [type] = values[0] || [];

  return (
    <>
      {permission?.granted ? (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          facing="back"
          onBarcodeScanned={hasValue ? undefined : handleBarcodeScanned}
          style={style.scanner}
        />
      ) : (
        <View style={style.scanner} />
      )}
      <View style={style.screen}>
        <SafeAreaView style={style.header}>
          <View row spaceBetween>
            <View row style={style.headerLeft}>
              <Button icon={ICON.BACK} small secondary onPress={handleBack} />
            </View>
            <Text bold subtitle style={style.text}>
              Scanner
            </Text>
            <View row style={style.headerRight} />
          </View>
        </SafeAreaView>

        <View row style={[style.section]}></View>

        <View row wide>
          <View style={style.section} wide />

          <View style={style.frame}>
            <View style={[style.corner, style.topLeft]} />
            <View style={[style.corner, style.topRight]} />
            <View style={[style.corner, style.bottomLeft]} />
            <View style={[style.corner, style.bottomRight]} />

            {reveal && (
              <Text bold caption align="center">
                {QRParser.decode(QRParser.combine(...values))}
              </Text>
            )}
          </View>

          <View style={style.section} wide />
        </View>

        <View spaceBetween style={[style.section, style.footer]}>
          {!hasValue && (
            <Text align="center" caption={!hasValue} style={style.text}>
              Place QR code inside the box
            </Text>
          )}

          <View style={{ flex: 1 }} />

          <Card>
            <Input />
          </Card>

          {hasValue && (
            <View row wide style={style.cardOptions}>
              {values.length === 1 && (
                <CardOption color="accent" icon={ICON.DATABASE_ADD} text="Save Secret" onPress={handleSave} />
              )}

              <CardOption
                icon={SECURE_TYPES.includes(type) && !passcode ? ICON.PASSCODE : ICON.EYE}
                onTouchCancel={() => setReveal(false)}
                onTouchEnd={() => setReveal(false)}
                onTouchMove={() => setReveal(false)}
                onTouchStart={() => setReveal(true)}
                onPress={() => {}}
                text={SECURE_TYPES.includes(type) && !passcode ? 'Set passcode' : 'Reveal Secret'}
              />

              <CardOption icon={ICON.REFRESH} text="Restart" onPress={handleReset} />
            </View>
          )}

          {/* {hasValue && (
            <Card gap>
              <View>
                <Text bold>Found</Text>
                <Text caption>Lorem ipsum dolor sit amet consectetur.</Text>
              </View>
              <Input placeholder="Name..." />
              <Button _disabled secondary _wide onPress={handleSave}>
                Import
              </Button>
            </Card>
          )} */}
        </View>
      </View>
    </>
  );
};

Scanner.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Scanner };
