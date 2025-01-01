import { useFocusEffect } from '@react-navigation/native';
import { Icon, Modal, Pagination, Pressable, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { Share, useWindowDimensions } from 'react-native';

import { CardOption } from './components';
import { style } from './Viewer.style';
import { QR } from '../../components';
import { useStore } from '../../contexts';
import { ICON } from '../../modules';

const QR_SIZE = 256;

const Viewer = ({
  route: { params: { hash, favorite = false, name, readMode = false, values = [] } = {} },
  navigation = {},
}) => {
  const qrRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { createSecret, deleteSecret, readSecret, updateSecret } = useStore();
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => readSecret({ hash }), []));

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
    await Share.share({ message: `secretqr://${values[currentIndex]}` }).catch(() => {});
  };

  const handleFavorite = async () => {
    await updateSecret({ hash, favorite: !favorite });
    // !TODO Send notification
  };

  const next = () => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
  };

  return (
    <Modal onClose={navigation.goBack}>
      <View align="center" row style={style.name}>
        {readMode && (
          <Pressable onPress={handleFavorite}>
            <Icon name={favorite ? ICON.FAVORITE : ICON.UNFAVORITE} title />
          </Pressable>
        )}

        <Text bold title>
          {name}
        </Text>
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
            {values.length > 1 && <Text caption color="contentLight">{`[Shard ${index + 1}]`}</Text>}
            <QR
              //
              ref={readMode || currentIndex === index ? qrRef : undefined}
              size={QR_SIZE}
              value={value}
            />
          </View>
        ))}
      </ScrollView>

      {values.length > 1 && (
        <View align="center" wide style={style.pagination}>
          <Pagination currentIndex={currentIndex} length={values.length} />
        </View>
      )}

      <View row style={style.cardOptions}>
        {!readMode && currentIndex === 0 && (
          <CardOption color="accent" icon={ICON.DATABASE_ADD} text="Save in vault" onPress={handleSave} />
        )}
        {readMode && <CardOption color="accent" icon={ICON.DATABASE_REMOVE} text="Delete QR" onPress={handleDelete} />}

        <CardOption icon={ICON.QRCODE} text="Share QR" onPress={handleShareQr} />
        <CardOption icon={ICON.BARCODE} text="Share Code" onPress={handleShareCode} />
      </View>
    </Modal>
  );
};

Viewer.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Viewer };
