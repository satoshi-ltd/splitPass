import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';

import { style } from './VaultScreen.style';
import { Button, Text, View } from '../../__primitives__';
import { QR_TYPE } from '../../App.constants';
import { QR, Screen } from '../../components';
import { VaultService } from '../../services';

const { SEED_PHRASE_ENCRYPTED } = QR_TYPE;

// eslint-disable-next-line react/prop-types
export const VaultScreen = ({ navigation: { navigate } = {} }) => {
  const [dataSource, setDataSource] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => setDataSource(await VaultService.get()))();
    }, []),
  );

  const handlePress = (qr, name) => {
    navigate('modal', { qrs: [qr], names: [name], readMode: true });
  };

  return (
    <Screen>
      {dataSource.map(({ qr, name, timestamp } = {}, index) => {
        const [type] = qr;

        return (
          <View row key={qr} style={style.item}>
            <QR size={40} value={index.toString()} />

            <View style={style.texts}>
              <Text bold>{name}</Text>
              <Text color="contentLight" tiny>
                {type === SEED_PHRASE_ENCRYPTED ? 'Seedphrase' : 'Password'}
                {` - `}
                {new Date(timestamp).toLocaleDateString()}
              </Text>
            </View>

            <Button small onPress={() => handlePress(qr, name)}>
              View
            </Button>
          </View>
        );
      })}
    </Screen>
  );
};
