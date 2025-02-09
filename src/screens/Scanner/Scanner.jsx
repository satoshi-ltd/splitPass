import { useFocusEffect } from '@react-navigation/native';
import { Screen, Tabs, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';

import { ScannerNFC } from './Scanner.nfc';
import { ScannerQR } from './Scanner.qr';
import { style } from './Scanner.style';
import { FIELD, IS_WEB, READER_TYPE, SECURE_TYPES, SHARD_TYPES, SECRET_TYPE } from '../../App.constants';
import { EVENT } from '../../App.constants';
import { CardMarketplace, CardOption, Form } from '../../components';
import { useStore } from '../../contexts';
import { eventEmitter, ICON, L10N, QRParser } from '../../modules';

const Scanner = ({
  navigation,
  route: { params: { readMode = false, readerType: propReaderType = READER_TYPE.QR, values: propValues = [] } = {} },
}) => {
  const { createSecret } = useStore();

  const [fields, setFields] = useState();
  const [form, setForm] = useState({});
  const [readerType, setReaderType] = useState(propReaderType);
  const [reveal, setReveal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [values, setValues] = useState([]);

  // ! TODO: We need this effect?
  useFocusEffect(
    useCallback(() => {
      handleReaderType(propReaderType);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (readMode && propValues.length) handleScanned(propValues[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propValues, readMode]);

  const handleReaderType = (next) => {
    setScanning(next === READER_TYPE.QR);
    setReaderType(next);
  };

  const handleScanned = (data = '') => {
    const [type] = data;

    if (!Object.values(SECRET_TYPE).includes(type)) return;

    setScanning(false);
    if (SHARD_TYPES.includes(type)) {
      if (values.length < 2) setTimeout(() => handleReaderType(readerType), 1000);
      if (values.includes(data)) {
        return eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.FIRST_SHARD_SAME });
      } else if (!values.length) {
        eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.FIRST_SHARD_SCANNED });
      } else {
        eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SHARDS_COMBINED, title: L10N.SUCCESS });
      }
    }
    setValues([...values, data]);
  };

  const handleReset = () => {
    handleReaderType(readerType);
    setForm({});
    setFields();
    setValues([]);
  };

  const handleSubmitForm = async (nextForm) => {
    setForm(nextForm);

    if (nextForm.secret) {
      const secret = await createSecret({ name: nextForm.secret, value: values[0] });
      if (secret) eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_SAVED_IN_DEVICE, title: L10N.SUCCESS });
    }
  };

  const [type] = values[0] || [];

  const is = {
    empty: !values.length,
    form: !!Object.values(form).length,
    modeNFC: readerType === READER_TYPE.NFC,
    secure: SECURE_TYPES.includes(type),
    shard: SHARD_TYPES.includes(type),
    complete: values.length > 0 && (!SHARD_TYPES.includes(type) || values.length > 1),
  };

  const Wrapper = IS_WEB ? React.Fragment : KeyboardAvoidingView;

  return (
    <Screen disableScroll style={style.screen}>
      <Wrapper behavior="padding">
        <View style={style.container}>
          <View style={style.background}>
            <Tabs
              caption
              selected={readerType === READER_TYPE.QR ? 0 : 1}
              options={[
                { icon: ICON.QRCODE, text: L10N.QR_CODE, type: READER_TYPE.QR },
                { icon: ICON.NFC, text: L10N.NFC_CARD, type: READER_TYPE.NFC },
              ]}
              onChange={({ type: next }) => handleReaderType(next)}
              style={style.tabs}
            />
          </View>

          {React.createElement(is.modeNFC ? ScannerNFC : ScannerQR, {
            is,
            reveal: reveal ? QRParser.decode(QRParser.combine(...values), form.passcode) : undefined,
            scanning,
            onRead: handleScanned,
          })}

          <View style={[style.footer, style.background]}>
            {fields && !is.form ? (
              <Form fields={fields} onCancel={setFields} onSubmit={handleSubmitForm} style={style.input} />
            ) : !is.empty || is.modeNFC ? (
              <View row style={style.cardOptions}>
                {!is.empty && <CardOption icon={ICON.REFRESH} text={L10N.RESTART} onPress={handleReset} />}

                {values.length === 1 && !readMode && (
                  <CardOption
                    icon={ICON.DATABASE_ADD}
                    text={L10N.SAVE_IN_DEVICE}
                    onPress={() => setFields([FIELD.NAME])}
                  />
                )}

                {is.complete && (
                  <CardOption
                    color="accent"
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

                {is.modeNFC && is.empty && <CardMarketplace onPress={() => navigation.navigate('marketplace')} />}
              </View>
            ) : null}
          </View>
        </View>
      </Wrapper>
    </Screen>
  );
};

Scanner.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Scanner };
