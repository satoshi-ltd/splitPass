import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View } from '@satoshi-ltd/nano-design';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';
import NfcManager from 'react-native-nfc-manager';

import { style } from './Scanner.style';
import { FIELD, SECURE_TYPES, SHARD_TYPES, QR_TYPE } from '../../App.constants';
import { Form } from '../../components';
import { useStore } from '../../contexts';
import { ICON, L10N, QRParser } from '../../modules';
// ! TODO: Refacto
import { CardOption } from '../Viewer/components';

const IS_WEB = Platform.OS === 'web';

const Scanner = ({ navigation, route: { params: { readMode = false, values: propValues = [] } = {} } }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const { createSecret } = useStore();

  const [active, setActive] = useState(false);
  const [hasNFC, setHasNFC] = useState(false);
  const [fields, setFields] = useState();
  const [form, setForm] = useState({});
  const [reveal, setReveal] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [values, setValues] = useState([]);

  useFocusEffect(
    useCallback(async () => {
      setActive(true);
      setScanning(true);

      if (!permission?.granted) return requestPermission();
    }, []),
  );

  useEffect(() => {
    const setupNFC = async () => {
      try {
        const supported = await NfcManager.isSupported();
        setHasNFC(supported);

        if (supported) {
          await NfcManager.start();
        }
      } catch (error) {
        console.log('Error al inicializar NFC:', error);
      }
    };

    setupNFC();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  console.log({ hasNFC });

  useEffect(() => {
    if (readMode && propValues.length) handleBarcodeScanned({ data: propValues[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propValues, readMode]);

  const handleBack = () => {
    setActive(false);
    navigation.goBack();
  };

  const handleBarcodeScanned = ({ data = '' } = {}) => {
    const [type] = data;

    if (!Object.values(QR_TYPE).includes(type)) return;

    setScanning(false);
    if (SHARD_TYPES.includes(type)) {
      if (values.length < 2) setTimeout(() => setScanning(true), 1000);
      if (values.includes(data)) {
        // ! TODO: Make it a notification
        return alert('Alert: Same shard');
      }
    }
    setValues([...values, data]);
  };

  const handleReset = () => {
    setScanning(true);
    setValues([]);
  };

  const handleSubmitForm = async (nextForm) => {
    setForm(nextForm);

    if (nextForm.secret) {
      await createSecret({ name: nextForm.secret, value: values[0] });
      navigation.goBack();
      // !TODO
      // navigation.navigate('vault');
    }
  };

  const [type] = values[0] || [];

  const is = {
    empty: !values.length,
    fields: fields?.length > 0,
    form: !!Object.values(form).length,
    secure: SECURE_TYPES.includes(type),
    shard: SHARD_TYPES.includes(type),
  };

  const Wrapper = IS_WEB ? React.Fragment : KeyboardAvoidingView;

  return (
    <>
      {permission?.granted ? (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'], isSupported: true }}
          facing="back"
          onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
          style={style.scanner}
        />
      ) : (
        <View style={style.scanner} />
      )}
      <Wrapper behavior="padding">
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
                <View align="center" style={style.reveal}>
                  <Text align="center" bold caption color={StyleSheet.value('$qrBackgroundColor')}>
                    {QRParser.decode(QRParser.combine(...values), form.passcode)}
                  </Text>
                </View>
              )}
            </View>

            <View style={style.section} wide />
          </View>

          <View spaceBetween style={[style.section, style.footer]}>
            {scanning && (
              <>
                {is.shard && (
                  <Text align="center" bold style={style.text}>
                    First shard scanned
                  </Text>
                )}
                <Text align="center" caption={is.scanning}>
                  {is.shard ? 'Scan the second shard to continue' : 'Place QR code inside the box'}
                </Text>
              </>
            )}

            <View style={{ flex: 1 }} />

            {fields && !is.form ? (
              <Form fields={fields} onCancel={setFields} onSubmit={handleSubmitForm} />
            ) : !is.empty ? (
              <View row wide style={style.cardOptions}>
                {values.length === 1 && !readMode && (
                  <CardOption
                    color="accent"
                    icon={ICON.DATABASE_ADD}
                    text={L10N.SAVE_SECRET}
                    onPress={() => setFields([FIELD.NAME])}
                  />
                )}

                {(!is.shard || values.length > 1) && (
                  <CardOption
                    icon={is.secure && !form.passcode ? ICON.PASSCODE : ICON.EYE}
                    text={is.secure && !form.passcode ? L10N.SET_PASSCODE : L10N.REVEAL_SECRET}
                    {...(is.secure && !form.passcode
                      ? { onPress: () => setFields([FIELD.PASSCODE]) }
                      : {
                          onTouchCancel: () => setReveal(false),
                          onTouchEnd: () => setReveal(false),
                          onTouchMove: () => setReveal(false),
                          onTouchStart: () => setReveal(true),
                          onPress: () => {},
                        })}
                  />
                )}

                <CardOption icon={ICON.REFRESH} text={L10N.RESCAN} onPress={handleReset} />
              </View>
            ) : null}
          </View>
        </View>
      </Wrapper>
    </>
  );
};

Scanner.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Scanner };
