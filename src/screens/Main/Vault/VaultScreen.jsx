import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { groupByType } from './modules';
import { style } from './VaultScreen.style';
import { Input, Pressable, Screen, Text, View } from '../../../__nano-design__';
import { QR_TYPE } from '../../../App.constants';
import { QR } from '../../../components';
import { useStore } from '../../../contexts';

const { PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const VaultScreen = ({ navigation: { navigate } = {} }) => {
  const { qrs = [] } = useStore();

  const [search, setSearch] = useState();

  useEffect(() => {
    setSearch();
  }, [qrs]);

  const handlePress = (qr, name) => {
    navigate('export', { qrs: [qr], names: [name], readMode: true });
  };

  return (
    <Screen gap offset>
      <Input placeholder="Search..." value={search} onChange={setSearch} />

      {Object.entries(groupByType(qrs, search)).map(([type, qrs = []]) => {
        return (
          <View key={type}>
            <View row>
              <Text bold subtitle>
                {`${type} keys`}
              </Text>
              <Text tiny>({qrs.length})</Text>
            </View>

            <View style={style.items}>
              {qrs.map(({ qr, name, timestamp } = {}, index) => {
                const [type] = qr;

                return (
                  <Pressable key={`${qr}:${index}`} onPress={() => handlePress(qr, name)}>
                    <View row style={style.item}>
                      <QR inline rounded={false} size={42} value={index.toString().padStart(8, 0)} />

                      <View flex>
                        <View flex row spaceBetween>
                          <Text bold>{name}</Text>
                          <Text caption color="contentLight" tiny>
                            {new Intl.DateTimeFormat('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }).format(timestamp)}
                          </Text>
                        </View>

                        <Text caption color="contentLight">
                          {[PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(type)
                            ? 'Secured'
                            : qr.includes('00') || qr.includes('0000')
                            ? 'Shard'
                            : 'Master'}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </Screen>
  );
};

VaultScreen.propTypes = {
  navigation: PropTypes.any,
};

export { VaultScreen };
