import { useFocusEffect } from '@react-navigation/native';
import { Button, Icon, Modal, Pagination, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { style } from './Viewer.style';
import { EVENT, FIELD, SECURE_TYPES, SHARD_TYPES } from '../../App.constants';
import { CardOption, Form, QR } from '../../components';
import { useStore } from '../../contexts';
import { eventEmitter, ICON, L10N } from '../../modules';

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
    navigation.navigate('confirm', {
      caption: L10N.DELETE_SECRET_CAPTION,
      title: L10N.DELETE_SECRET_TITLE,
      onAccept: async () => {
        await deleteSecret({ hash });
        eventEmitter.emit(EVENT.NOTIFICATION, { message: L10N.SECRET_DELETED });
        navigation.goBack();
      },
    });
  };

  const handleShare = async () => {
    const uri = await qrRef.current.capture();
    await Sharing.shareAsync(uri);
  };

  const handleGoToScanner = () => {
    navigation.goBack();
    navigation.navigate('scanner', { readMode: true, values });
  };

  const handleFavorite = async () => {
    const nextFavorite = !favorite;

    await updateSecret({ hash, favorite: nextFavorite });
    setFavorite(nextFavorite);
  };

  const handleNFCCard = () => {
    navigation.goBack();
    navigation.navigate('splitcard', { writeMode: { name, value: values[currentIndex] } });
  };

  const handleOptions = () => {
    const options = [
      {
        accent: favorite,
        text: L10N.FAVORITE,
        icon: favorite ? ICON.FAVORITE : ICON.UNFAVORITE,
        onPress: handleFavorite,
      },
      {
        critical: true,
        text: L10N.DELETE_SECRET,
        icon: ICON.DATABASE_REMOVE,
        onPress: handleDelete,
      },
    ];

    navigation.navigate('menu', { options });
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
      <Text align="center" bold secondary title style={style.name}>
        {name}
      </Text>

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
              onPress={!is.shard ? () => {} : undefined}
            />
            {(is.shard || values.length > 1) && (
              <View align="center" bold style={style.shard}>
                <Text bold tiny>
                  shard:{index + 1}
                </Text>
              </View>
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
        <View>
          {is.shard && (
            <Button outlined onPress={handleGoToScanner} style={style.buttonScanner}>
              {L10N.SCAN_SHARD}
            </Button>
          )}
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
        </View>
      )}

      {fields && !is.form ? (
        <Form fields={fields} onCancel={setFields} onSubmit={setForm} style={style.cardOptions} />
      ) : (
        <View row style={style.cardOptions}>
          {readMode && <CardOption icon={ICON.SETTINGS} squared onPress={handleOptions} />}

          {readMode && is.secure && !form.passcode ? (
            <CardOption icon={ICON.PASSCODE} text={L10N.SET_PASSCODE} onPress={() => setFields([FIELD.PASSCODE])} />
          ) : (
            <CardOption icon={ICON.SHARE} text={L10N.SHARE} onPress={handleShare} />
          )}

          {!readMode && currentIndex === 0 && (
            <CardOption icon={ICON.DATABASE_ADD} text={L10N.SAVE_IN_DEVICE} onPress={handleSave} />
          )}

          <CardOption color="accent" icon={ICON.NFC} text={L10N.SAVE_IN_CARD} onPress={handleNFCCard} />
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
