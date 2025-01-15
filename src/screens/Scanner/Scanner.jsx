import { useFocusEffect } from '@react-navigation/native';
import { Button, Tabs, Text, View } from '@satoshi-ltd/nano-design';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, SafeAreaView } from 'react-native';

import { ScannerNFC } from './Scanner.nfc';
import { ScannerQR } from './Scanner.qr';
import { style } from './Scanner.style';
import { FIELD, READER_TYPE, SECURE_TYPES, SHARD_TYPES, SECRET_TYPE } from '../../App.constants';
import { EVENT } from '../../App.constants';
import { Form } from '../../components';
import { useStore } from '../../contexts';
import { eventEmitter, ICON, L10N, QRParser } from '../../modules';
// ! TODO: Refacto
import { CardOption } from '../Viewer/components';

const Scanner = ({
  navigation,
  route: { params: { readMode = false, readerType: propReaderType = READER_TYPE.NFC, values: propValues = [] } = {} },
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const { createSecret } = useStore();

  const [active, setActive] = useState(false);
  const [fields, setFields] = useState();
  const [form, setForm] = useState({});
  const [reveal, setReveal] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [readerType, setReaderType] = useState(propReaderType);
  const [values, setValues] = useState([]);

  useFocusEffect(
    useCallback(async () => {
      setActive(true);
      setScanning(true);

      if (!permission?.granted) return requestPermission();
    }, []),
  );

  useEffect(() => {
    if (readMode && propValues.length) handleScanned(propValues[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propValues, readMode]);

  const handleBack = () => {
    setActive(false);
    navigation.goBack();
  };

  const handleScanned = (data = '') => {
    const [type] = data;

    console.log('>>>');

    if (!Object.values(SECRET_TYPE).includes(type)) return;

    setScanning(false);
    if (SHARD_TYPES.includes(type)) {
      if (values.length < 2) setTimeout(() => setScanning(true), 1000);
      if (values.includes(data)) {
        // ! TODO: Make it a notification
        return eventEmitter.emit(EVENT.NOTIFICATION, { error: true, message: '$$Alert; same shard' });
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
    NFCmode: readerType === READER_TYPE.NFC,
    empty: !values.length,
    fields: fields?.length > 0,
    form: !!Object.values(form).length,
    secure: SECURE_TYPES.includes(type),
    shard: SHARD_TYPES.includes(type),
  };

  return (
    <>
      {permission?.granted && !is.NFCmode && (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'], isSupported: true }}
          facing="back"
          onBarcodeScanned={scanning ? ({ data = '' }) => handleScanned(data) : undefined}
          style={style.camera}
        />
      )}

      <KeyboardAvoidingView behavior="padding">
        <View style={style.screen}>
          <View style={[style.instructions, style.background]}>
            <Tabs
              caption
              selected={readerType === READER_TYPE.QR ? 0 : 1}
              options={[
                { icon: ICON.QRCODE, text: 'QR Code', type: READER_TYPE.QR },
                { icon: ICON.NFC, text: 'NFC Card', type: READER_TYPE.NFC },
              ]}
              onChange={({ type: next }) => setReaderType(next)}
              style={style.tabs}
            />

            <Text align="center" bold secondary title style={[style.instructionsContent, style.text]}>
              {is.NFCmode ? L10N.SCANNER_NFC_TITLE : L10N.SCANNER_QR_TITLE}
            </Text>
            <Text align="center" caption color="contentLight" style={style.instructionsContent}>
              {is.NFCmode ? L10N.SCANNER_NFC_CAPTION : L10N.SCANNER_QR_CAPTION}
            </Text>
          </View>

          {React.createElement(is.NFCmode ? ScannerNFC : ScannerQR, {
            reveal: reveal ? QRParser.decode(QRParser.combine(...values), form.passcode) : undefined,
            onRead: handleScanned,
          })}

          {scanning && is.shard && (
            <View style={style.background}>
              <Text align="center" bold style={[style.scanningText, style.text]}>
                First shard scanned
              </Text>
              <Text align="center" caption color="contentLight">
                Scan the second shard to continue
              </Text>
            </View>
          )}

          <View spaceBetween style={style.footer}>
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
      </KeyboardAvoidingView>
    </>
  );
};

Scanner.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Scanner };
