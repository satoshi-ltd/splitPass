import { Action, Button, Input, Modal, Pagination, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { Share, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { style } from './ExportScreen.style';
import { QR_TYPE } from '../../App.constants';
import { QR } from '../../components';
import { useStore } from '../../contexts';

const { PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const QR_SIZE = 256;

const ExportScreen = ({
  route: { params: { qrs = [], names = [], readMode = false } = {} },
  navigation: { goBack, navigate },
}) => {
  const qrRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { addQr } = useStore();
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState();

  const handleScroll = ({ nativeEvent: { contentOffset: { x } = {} } = {} }) => {
    setCurrentIndex(Math.round(x / width));
  };

  const handleSave = async () => {
    const qr = qrs[currentIndex];

    await addQr(qr, name);
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
    await Share.share({ message: `secretqr://${qrs[currentIndex]}` }).catch(() => {});
  };

  const next = () => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
  };

  const hasEncrypted = qrs.some((qr) => {
    const [type] = qr;
    return [PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(type);
  });

  const [type] = qrs[currentIndex];
  const encrypted = [PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(type);

  return (
    <Modal gap>
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
            {encrypted && !readMode ? (
              <Input
                align="center"
                placeholder="Name your shard..."
                valid={name?.length > 1}
                value={name}
                onChange={setName}
                style={{ width: QR_SIZE }}
              />
            ) : (
              <View row>
                <Text bold subtitle style={style.title}>
                  {readMode ? names[index] : `Shard`}
                </Text>
                {!readMode && <Text tiny>{`[${index + 1}]`}</Text>}
              </View>
            )}
            <QR ref={readMode || currentIndex === index ? qrRef : undefined} size={QR_SIZE} value={qr} />
          </View>
        ))}
      </ScrollView>

      {qrs.length > 1 && (
        <View align="center" wide>
          <Pagination currentIndex={currentIndex} length={qrs.length} />
        </View>
      )}

      <View style={[style.footer, hasEncrypted && !readMode && style.footerMaximize]}>
        {encrypted && !readMode && (
          <Button secondary disabled={!name || name?.length < 1} onPress={handleSave}>
            Save in vault
          </Button>
        )}

        <Button outlined={!readMode} onPress={handleShareQr}>
          Share QR
        </Button>

        <Button outlined onPress={handleShareCode}>
          Share Code
        </Button>

        <Action color="content" onPress={() => goBack()}>
          {readMode ? 'Close' : 'Cancel'}
        </Action>
      </View>
    </Modal>
  );
};

ExportScreen.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { ExportScreen };
