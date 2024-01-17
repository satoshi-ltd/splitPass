/* eslint-disable react/prop-types */
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { SafeAreaView, Share, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { style } from './ExportScreen.style';
import { Action, Button, Input, ScrollView, Text, View } from '../../__primitives__';
import { QR_TYPE } from '../../App.constants';
import { QR } from '../../components';
import { VaultService } from '../../services';

const { PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const QR_SIZE = 256;

const ExportScreen = ({ route: { params: { qrs = [], readMode = false } = {} }, navigation: { goBack } }) => {
  const qrRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState();

  const handleScroll = ({ nativeEvent: { contentOffset: { x } = {} } = {} }) => {
    setCurrentIndex(Math.round(x / width));
  };

  const handleNext = () => {
    if (currentIndex < qrs.length - 1) next();
    else goBack();
  };

  const handleSave = async () => {
    const qr = qrs[currentIndex];

    await VaultService.addQr(qr, name);
    next();
  };

  const handleShareQr = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 0.8,
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error al intentar compartir:', error.message);
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({ message: qrs[currentIndex] });
    } catch (error) {
      console.error('Error al intentar compartir:', error.message);
    }
  };

  const next = () => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
  };

  const [type] = qrs[currentIndex];
  const encrypted = [PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(type);

  return (
    <SafeAreaView style={style.screen}>
      {qrs.length > 1 && (
        <View row style={style.steps}>
          {qrs.map((_, index) => (
            <View key={index} wide style={[style.step, index !== currentIndex && style.stepDisabled]} />
          ))}
        </View>
      )}

      <ScrollView
        decelerationRate="fast"
        horizontal
        pagingEnabled
        ref={scrollViewRef}
        scrollEventThrottle={10}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        onScroll={handleScroll}
      >
        {qrs.map((qr, index) => (
          <View align="center" key={index} style={[style.item, { width }]}>
            {encrypted ? (
              <Input
                align="center"
                placeholder="Give a name..."
                valid={name?.length > 1}
                value={name}
                onChange={setName}
                style={{ width: QR_SIZE }}
              />
            ) : (
              <Text bold subtitle style={style.title}>
                {`Shard ${index + 1} / ${qrs.length}`}
              </Text>
            )}
            <QR ref={currentIndex === index ? qrRef : undefined} size={QR_SIZE} value={qr} />
            {!readMode && <Text tiny>{encrypted ? 'This is your shard.' : ' '}</Text>}
          </View>
        ))}
      </ScrollView>

      <View style={style.buttons}>
        {encrypted && !readMode && (
          <Button disabled={!name || name?.length < 1} onPress={handleSave}>
            Save in vault
          </Button>
        )}

        <Button secondary onPress={handleShareQr}>
          Share QR
        </Button>

        <Button secondary onPress={handleShareCode}>
          Share Code
        </Button>

        <View row spaceBetween>
          <Action onPress={() => goBack()}>Cancel</Action>
          {qrs.length > 1 && <Action onPress={handleNext}>Next</Action>}
        </View>
      </View>
    </SafeAreaView>
  );
};

export { ExportScreen };
