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

const ExportScreen = ({
  route: { params: { qrs = [], names = [], readMode = false } = {} },
  navigation: { goBack, navigate },
}) => {
  const qrRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState();

  const handleScroll = ({ nativeEvent: { contentOffset: { x } = {} } = {} }) => {
    setCurrentIndex(Math.round(x / width));
  };

  const handleSave = async () => {
    const qr = qrs[currentIndex];

    await VaultService.addQr(qr, name);
    if (qrs.length > 1) next();
    else {
      // goBack();
      navigate('vault');
    }
  };

  const handleShareQr = async () => {
    const uri = await captureRef(qrRef, { format: 'png', quality: 0.8 }).catch(() => {});
    await Sharing.shareAsync(uri);
  };

  const handleShareCode = async () => {
    await Share.share({ message: `shardqr://${qrs[currentIndex]}` }).catch(() => {});
  };

  const next = () => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
  };

  const [type] = qrs[currentIndex];
  const encrypted = [PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(type);

  return (
    <SafeAreaView style={[style.screen, readMode && style.readMode]}>
      {qrs.length > 1 && (
        <View row style={style.breadcrumbs}>
          {qrs.map((_, index) => (
            <View key={index} wide style={[style.breadcrumb, index !== currentIndex && style.disabled]} />
          ))}
        </View>
      )}

      <ScrollView
        decelerationRate="fast"
        horizontal
        pagingEnabled
        ref={scrollViewRef}
        scrollEnabled={!readMode}
        scrollEventThrottle={10}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        onScroll={handleScroll}
      >
        {qrs.map((qr, index) => (
          <View align="center" key={index} style={[style.item, { width }]}>
            {encrypted && !readMode ? (
              <Input
                align="center"
                placeholder="Give a name..."
                valid={name?.length > 1}
                value={name}
                onChange={setName}
                style={{ width: QR_SIZE }}
              />
            ) : (
              <Text bold color={readMode ? 'base' : undefined} subtitle style={[!readMode && style.title]}>
                {readMode ? names[index] : `Shard ${index + 1} / ${qrs.length}`}
              </Text>
            )}
            <QR ref={!readMode && currentIndex === index ? qrRef : undefined} size={QR_SIZE} value={qr} />
            {!readMode && <Text tiny>{encrypted ? 'This is your shard.' : ' '}</Text>}
          </View>
        ))}
      </ScrollView>

      <View style={[style.footer, !readMode && style.footerFixed]}>
        {encrypted && !readMode && (
          <Button disabled={!name || name?.length < 1} onPress={handleSave}>
            Save in vault
          </Button>
        )}

        <Button contrast={readMode} secondary onPress={handleShareQr}>
          Share QR
        </Button>

        <Button contrast={readMode} secondary onPress={handleShareCode}>
          Share Code
        </Button>

        <Action color={readMode ? 'base' : undefined} onPress={() => goBack()}>
          Cancel
        </Action>
      </View>
    </SafeAreaView>
  );
};

export { ExportScreen };
