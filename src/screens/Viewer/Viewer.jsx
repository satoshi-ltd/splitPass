import { useFocusEffect } from '@react-navigation/native';
import { Button, Icon, Modal, Pagination, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { Share, useWindowDimensions } from 'react-native';

import { CardOption } from './components';
import { style } from './Viewer.style';
import { FIELD, SECURE_TYPES, SHARD_TYPES } from '../../App.constants';
import { Form, QR } from '../../components';
import { useStore } from '../../contexts';
import { ICON, L10N } from '../../modules';

const QR_SIZE = 256;

const Viewer = ({
  route: { params: { hash, favorite: propFavorite = false, name, readMode = false, values = [] } = {} },
  navigation = {},
}) => {
  const qrRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { createSecret, deleteSecret, readSecret, updateSecret } = useStore();
  const { width } = useWindowDimensions();

  const [favorite, setFavorite] = useState(propFavorite);
  const [fields, setFields] = useState();
  const [form, setForm] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(
    useCallback(() => {
      readSecret({ hash });
    }, []),
  );

  const handleScroll = ({ nativeEvent: { contentOffset: { x } = {} } = {} }) => {
    setCurrentIndex(Math.round(x / width));
  };

  const handleSave = async () => {
    await createSecret({ name, value: values[currentIndex] });
    if (values.length > 1) next();
    else navigation.goBack();
  };

  const handleDelete = async () => {
    await deleteSecret({ hash });
    navigation.goBack();
  };

  const handleShareQr = async () => {
    const uri = await qrRef.current.capture();
    await Sharing.shareAsync(uri);
  };

  const handleShareCode = async () => {
    await Share.share({ message: `splitpass://${values[currentIndex]}` }).catch(() => {});
  };

  const handleFavorite = async () => {
    const nextFavorite = !favorite;

    await updateSecret({ hash, favorite: nextFavorite });
    setFavorite(nextFavorite);
  };

  const next = () => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
  };

  const [type] = values[0];

  const is = {
    form: !!Object.values(form).length,
    secure: SECURE_TYPES.includes(type),
    shard: SHARD_TYPES.includes(type),
  };

  return (
    <Modal gap onClose={navigation.goBack}>
      <View align="center" row style={style.name}>
        <Text bold secondary title>
          {name}
        </Text>

        {readMode && (
          <Button
            outlined={!favorite}
            secondary={favorite}
            small
            icon={favorite ? ICON.FAVORITE : ICON.UNFAVORITE}
            onPress={handleFavorite}
          />
        )}
      </View>

      <ScrollView
        horizontal
        ref={scrollViewRef}
        scrollEnabled={!readMode}
        snap={width}
        onScroll={handleScroll}
        style={style.scrollView}
      >
        {values.map((value, index) => (
          <View align="center" key={index} style={[style.item, { width }]}>
            <QR
              key={index}
              {...{ passcode: form.passcode, readMode }}
              ref={readMode || currentIndex === index ? qrRef : undefined}
              size={QR_SIZE}
              value={value}
              onPress={() => {}}
            />
            {values.length > 1 && (
              <Text align="center" bold style={style.shard}>
                {index + 1}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {values.length > 1 && (
        <View align="center" wide>
          <Pagination currentIndex={currentIndex} length={values.length} />
        </View>
      )}

      {readMode && (
        <View align="center" row style={style.caption}>
          <Icon caption name={[...SECURE_TYPES, ...SHARD_TYPES].includes(type) ? ICON.WARNING : ICON.INFO} />
          <Text align="center" color="contentLight" tiny>
            {is.secure
              ? L10N.VIEWER_CAPTION_ENTER_PASSCODE
              : is.shard
              ? L10N.VIEWER_CAPTION_SHARD_SCANNER
              : L10N.VIEWER_CAPTION_HOLD_TO_REVEAL}
          </Text>
        </View>
      )}

      {fields && !is.form ? (
        <Form fields={fields} onCancel={setFields} onSubmit={setForm} style={style.cardOptions} />
      ) : (
        <View row style={style.cardOptions}>
          {!readMode && currentIndex === 0 ? (
            <CardOption color="accent" icon={ICON.DATABASE_ADD} text={L10N.SAVE_SECRET} onPress={handleSave} />
          ) : readMode ? (
            <CardOption color="accent" icon={ICON.DATABASE_REMOVE} text={L10N.DELETE_SECRET} onPress={handleDelete} />
          ) : null}

          {readMode && is.secure && !form.passcode ? (
            <CardOption icon={ICON.PASSCODE} text={L10N.SET_PASSCODE} onPress={() => setFields([FIELD.PASSCODE])} />
          ) : (
            <>
              <CardOption icon={ICON.QRCODE} text={L10N.SHARE_QR} onPress={handleShareQr} />
              <CardOption icon={ICON.BARCODE} text={L10N.SHARE_CODE} onPress={handleShareCode} />
            </>
          )}
        </View>
      )}
    </Modal>
  );
};

Viewer.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Viewer };
