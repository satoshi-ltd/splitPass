/* eslint-disable react/prop-types */
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { SafeAreaView, useWindowDimensions } from 'react-native';

import { style } from './ModalGenerate.style';
import { Action, Button, Input, ScrollView, Text, View } from '../../__primitives__';
import { QR } from '../../components';

const QR_SIZE = 256;

export const ModalGenerate = ({
  route: {
    params: {
      qrs = [
        // '14310353',
        // '143103532151737613007585549655006',
        // '3149716592017126415681576158716001082156315491186',
        // '4194261484860145057294838133867444832126163684203126057273892154656283453145856383649282060254595',
        // '4194261484860145057294838133867444832126163684203126057273892154656283453145856383649282060254595',
      ],
    } = {},
  },
  navigation: { goBack },
}) => {
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState();

  const handleScroll = ({ nativeEvent: { contentOffset: { x } = {} } = {} }) => {
    setCurrentIndex(Math.round(x / width));
  };

  const handleShare = async () => {
    try {
      await Sharing.shareAsync('¡Hola! Estoy compartiendo este mensaje.', {});
    } catch (error) {
      console.error('Error al intentar compartir:', error.message);
    }
  };

  const handleNext = () => {
    if (currentIndex === qrs.length - 1) return goBack();
  };

  const isStandalone = currentIndex === 0;

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
        scrollEventThrottle={10}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        onScroll={handleScroll}
      >
        {qrs.map((qr, index) => (
          <View align="center" key={index} style={[style.item, { width }]}>
            {index === 0 ? (
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
            <QR size={QR_SIZE} value={qr} />
            <Text tiny>{qr}</Text>
            <Text tiny>{index === 0 ? 'This is your shard.' : ' '}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={style.buttons}>
        {isStandalone && (
          <Button disabled={!name || name?.length < 1} onPress={handleShare}>
            Save in vault
          </Button>
        )}

        {/*
        <Button secondary onPress={handleShare}>
          Share QR
        </Button> */}

        <Button secondary onPress={handleShare}>
          Share Code
        </Button>

        <View row spaceBetween>
          <Action onPress={() => goBack()}>Cancel</Action>
          <Action onPress={handleNext}>Next</Action>
        </View>
      </View>
    </SafeAreaView>
  );
};
