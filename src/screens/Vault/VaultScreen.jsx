import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';

import { style } from './VaultScreen.style';
import { Pressable, Text, View } from '../../__primitives__';
import { QR_TYPE } from '../../App.constants';
import { QR, Screen } from '../../components';
import { VaultService } from '../../services';

const { DEFAULT_ENCRYPTED, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

// eslint-disable-next-line react/prop-types
export const VaultScreen = ({ navigation: { navigate } = {} }) => {
  const [dataSource, setDataSource] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => setDataSource(await VaultService.get()))();
    }, []),
  );

  const handlePress = (qr, name) => {
    navigate('export', { qrs: [qr], names: [name], readMode: true });
  };

  return (
    <Screen>
      {dataSource.map(({ qr, name } = {}, index) => {
        const [type] = qr;

        return (
          <Pressable key={`${qr}:${index}`} onPress={() => handlePress(qr, name)}>
            <View row style={style.item}>
              <QR inline rounded={false} size={44} value={index.toString().padStart(8, 0)} />

              <View style={style.texts}>
                <Text bold>{name}</Text>
                <Text color="contentLight" caption>
                  {[DEFAULT_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(type)
                    ? 'Secured'
                    : qr.includes('00') || qr.includes('0000')
                    ? 'Guardian'
                    : 'Root'}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
};
