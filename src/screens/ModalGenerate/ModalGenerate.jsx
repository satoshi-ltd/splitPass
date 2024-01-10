import * as Sharing from 'expo-sharing';
import React from 'react';
import QRCodeStyled from 'react-native-qrcode-styled';

import { style } from './ModalGenerate.style';
import { Button } from '../../__primitives__';
import { QR, Screen } from '../../components';

// eslint-disable-next-line react/prop-types
export const ModalGenerate = ({ route: { params: { secret } = {} }, navigation: { goBack } }) => {
  const handleShare = async () => {
    try {
      await Sharing.shareAsync('¡Hola! Estoy compartiendo este mensaje.', {});
    } catch (error) {
      console.error('Error al intentar compartir:', error.message);
    }
  };

  return (
    <Screen style={style.screen}>
      <QR value={secret} />

      <Button onPress={() => goBack()}>Back</Button>

      <Button secondary onPress={handleShare}>
        Share QR
      </Button>

      <Button secondary onPress={handleShare}>
        Share Code
      </Button>
    </Screen>
  );
};
