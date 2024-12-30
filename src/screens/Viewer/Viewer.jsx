import { Button, Card, Icon, Modal, Pagination, Pressable, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { Share, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { style } from './Viewer.style';
import { QR } from '../../components';
import { useStore } from '../../contexts';
import { ICON } from '../../modules';

const QR_SIZE = 256;

const Option = ({ color, icon, text, ...others }) => (
  <Pressable {...others} style={style.option}>
    <Card color={color} outlined={!color} small style={style.optionCard}>
      <Icon name={icon} title />
      <Text bold tiny>
        {text}
      </Text>
    </Card>
  </Pressable>
);

const Viewer = ({ route: { params: { qrs = [], name, readMode = false } = {} }, navigation = {} }) => {
  const qrRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { addQr } = useStore();
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = ({ nativeEvent: { contentOffset: { x } = {} } = {} }) => {
    setCurrentIndex(Math.round(x / width));
  };

  const handleSave = async () => {
    const qr = qrs[currentIndex];

    await addQr(qr, name);
    if (qrs.length > 1) next();
    else {
      // ! TODO: if is !readMode
      navigation.goBack();
    }
  };

  const handleShareQr = async () => {
    const uri = await captureRef(qrRef, { format: 'png', quality: 0.8 }).catch(() => {});
    await Sharing.shareAsync(uri);
  };

  const handleShareCode = async () => {
    await Share.share({ message: `secretqr://${qrs[currentIndex]}` }).catch(() => {});
  };

  const next = () => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
  };

  return (
    <Modal onClose={navigation.goBack}>
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
        {qrs.map((qr, index) => (
          <View align="center" key={index} style={[style.item, { width }]}>
            {qrs.length > 1 && <Text caption color="contentLight">{`[Shard ${index + 1}]`}</Text>}
            <QR
              //
              ref={readMode || currentIndex === index ? qrRef : undefined}
              size={QR_SIZE}
              value={qr}
            />
          </View>
        ))}
      </ScrollView>

      {qrs.length > 1 && (
        <View align="center" wide style={style.pagination}>
          <Pagination currentIndex={currentIndex} length={qrs.length} />
        </View>
      )}

      <View row style={style.footer}>
        {!readMode && currentIndex === 0 && (
          <Option color={'accent'} icon={ICON.DATABASE_ADD} text="Save in vault" onPress={handleSave} />
        )}

        <Option icon={ICON.QRCODE} text="Share QR" onPress={handleShareQr} />
        <Option icon={ICON.BARCODE} text="Share Code" onPress={handleShareCode} />
      </View>
    </Modal>
  );
};

Viewer.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Viewer };
