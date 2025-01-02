import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, Input, Text, View } from '@satoshi-ltd/nano-design';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { FORM } from './Scanner.constants';
import { style } from './Scanner.style';
import { QR_TYPE } from '../../App.constants';
import { useStore } from '../../contexts';
import { ICON, QRParser } from '../../modules';
import { CardOption } from '../Viewer/components';

const SECURE_TYPES = [QR_TYPE.PASSWORD_SECURE, QR_TYPE.SEED_PHRASE_SECURE];
const SHARD_TYPES = [QR_TYPE.PASSWORD_SHARD, QR_TYPE.SEED_PHRASE_SHARD];

const Scanner = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const { createSecret } = useStore();

  const [active, setActive] = useState(false);
  const [form, setForm] = useState({});
  const [values, setValues] = useState([]);
  const [reveal, setReveal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      // if (!permission?.granted) return requestPermission();

      handleBarcodeScanned();

      // TODO: this can not be done. useFocusEffect not accept return
      // return () => setActive(false);
    }, []),
  );

  const handleBack = () => {
    setActive(false);
    navigation.goBack();
  };

  const handleBarcodeScanned = ({
    data = '4071815361414022601171482010411321486003717561857003601150446031200160007022400260293169614131149',
  } = {}) => {
    // ! TODO: Should check if is a valid SecretQR
    const [type] = data;

    if (!Object.values(QR_TYPE).includes(type)) return;
    if (SHARD_TYPES.includes(type)) return alert('read next shard');

    setValues([...values, data]);
  };

  const handleReset = () => setValues([]);

  const handleSubmitForm = async () => {
    setForm({ ...form, [form.name]: form.value });

    if (form.name === 'secret') {
      await createSecret({ name: form.value, value: values[0] });
      navigation.goBack();
      // !TODO
      // navigation.navigate('vault');
    }
  };

  const [type] = values[0] || [];

  const is = {
    empty: !values.length,
    form: !!form.name && !form[form.name],
    secure: SECURE_TYPES.includes(type),
    shard: SHARD_TYPES.includes(type),
  };

  return (
    <>
      {permission?.granted ? (
        <CameraView
          active={active}
          autofocus="on"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
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

          {is.form ? (
            <Card gap outlined row small>
              <Input {...form} onChange={(value) => setForm({ ...form, value })} style={style.input} />
              <View gap row>
                <Button disabled={!form.value} icon={ICON.CHECK} secondary small onPress={handleSubmitForm} />
                <Button icon={ICON.CLOSE} small onPress={() => setForm({})} />
              </View>
            </Card>
          ) : !is.empty ? (
            <View row wide style={style.cardOptions}>
              {values.length === 1 && (
                <CardOption
                  color="accent"
                  icon={ICON.DATABASE_ADD}
                  text="Save Secret"
                  onPress={() => setForm(FORM.NAME)}
                />
              )}

              <CardOption
                icon={is.secure && !form.passcode ? ICON.PASSCODE : ICON.EYE}
                text={is.secure && !form.passcode ? 'Set passcode' : 'Reveal Secret'}
                {...(is.secure && !form.passcode
                  ? { onPress: () => setForm(FORM.PASSCODE) }
                  : {
                      onTouchCancel: () => setReveal(false),
                      onTouchEnd: () => setReveal(false),
                      onTouchMove: () => setReveal(false),
                      onTouchStart: () => setReveal(true),
                      onPress: () => {},
                    })}
              />

              <CardOption icon={ICON.REFRESH} text="Restart" onPress={handleReset} />
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
