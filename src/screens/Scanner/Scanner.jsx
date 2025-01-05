import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View } from '@satoshi-ltd/nano-design';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Scanner.style';
import { FIELD, SECURE_TYPES, SHARD_TYPES, QR_TYPE } from '../../App.constants';
import { Form } from '../../components';
import { useStore } from '../../contexts';
import { ICON, L10N, QRParser } from '../../modules';
// ! TODO: Refacto
import { CardOption } from '../Viewer/components';

const Scanner = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const { createSecret } = useStore();

  const [active, setActive] = useState(false);
  const [fields, setFields] = useState();
  const [form, setForm] = useState({});
  const [values, setValues] = useState([]);
  const [reveal, setReveal] = useState(false);

  useFocusEffect(
    useCallback(async () => {
      // handleBarcodeScanned();
      setActive(true);
      if (!permission?.granted) return requestPermission();

      // TODO: this can not be done. useFocusEffect not accept return
      // return () => setActive(false);
    }, []),
  );

  const handleBack = () => {
    setActive(false);
    navigation.goBack();
  };

  const handleBarcodeScanned = ({
    data = '',
    // data = '4000812771161163312421349138600180611163115910353092506140275186700831307139902341880124300411462',
    // data = '5232192903441395692653629360980312991395495142633224886372555318080063687361282573160356680643742',
    // data = '6000012771161000012421349000000180611000015910353000006140275000000831307000002341880000000411462',
  } = {}) => {
    const [type] = data;

    if (!Object.values(QR_TYPE).includes(type)) return;
    if (SHARD_TYPES.includes(type)) return alert('read next shard');

    setValues([...values, data]);
  };

  const handleReset = () => setValues([]);

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

  return (
    <>
      {permission?.granted ? (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'], isSupported: true }}
          facing="back"
          onBarcodeScanned={is.empty ? handleBarcodeScanned : undefined}
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
          {is.empty && (
            <Text align="center" caption={is.empty} style={style.text}>
              Place QR code inside the box
            </Text>
          )}

          <View style={{ flex: 1 }} />

          {fields && !is.form ? (
            <Form fields={fields} onCancel={setFields} onSubmit={handleSubmitForm} />
          ) : !is.empty ? (
            <View row wide style={style.cardOptions}>
              {values.length === 1 && (
                <CardOption
                  color="accent"
                  icon={ICON.DATABASE_ADD}
                  text={L10N.SAVE_SECRET}
                  onPress={() => setFields([FIELD.NAME])}
                />
              )}

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

              <CardOption icon={ICON.REFRESH} text={L10N.RESCAN} onPress={handleReset} />
            </View>
          ) : null}
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
