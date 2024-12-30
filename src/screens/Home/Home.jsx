import { Button, Card, Input, ScrollView, Pressable, Screen, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { BlurView } from 'expo-blur';

import { style } from './Home.style';
import { groupByType } from './modules';
import { QR_TYPE } from '../../App.constants';
import { useStore } from '../../contexts';

import { Logo } from '../../components';

const { PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const Home = ({ navigation }) => {
  const { qrs = [] } = useStore();

  const [search, setSearch] = useState();

  useEffect(() => {
    setSearch();
  }, [qrs]);

  useEffect(() => {
    setTimeout(() => {
      // navigation.navigate('create');
      // const { qr, name } = qrs[0];

      // navigation.navigate('viewer', { qrs: [qr], name });
    }, 10);
  }, []);

  const handlePress = (qr, name) => {
    navigation.navigate('viewer', { qrs: [qr], name, readMode: true });
  };

  return (
    <Screen disableScroll style={style.screen}>
      {/* <BlurView intensity={60} tint={'light'} style={style.header}>
        <View row spaceBetween wide>
          <Logo />

          <View gap>
            <Button />
          </View>
        </View>
      </BlurView> */}
      <ScrollView style={style.scrollview}>
        <Card gap style={style.section}>
          <View gap row spaceBetween>
            <View>
              <Text bold secondary subtitle>
                Become a Guardian
              </Text>
              <Text caption>Add a QR code to become a guardian of a Secret</Text>
            </View>
          </View>
          <Button wide onPress={() => navigation.navigate('import', { type: 'QR' })}>
            Add via a QR Code
          </Button>
          {/* <Button secondary wide onPress={() => navigation.navigate('import', { type: 'text' })}>
            Add via a Text Code
          </Button> */}
        </Card>

        {!qrs.length && (
          <Card gap style={style.section}>
            <View>
              <Text bold secondary subtitle>
                Become a Guardian
              </Text>
              <Text caption>Add a QR code to become a guardian of a Secret</Text>
            </View>
            <Button secondary wide onPress={() => navigation.navigate('import', { type: 'QR' })}>
              Your first SecretQR
            </Button>
          </Card>
        )}

        <Input placeholder="Search..." value={search} onChange={setSearch} style={style.section} />

        {Object.entries(groupByType(qrs, search)).map(([type, qrs = []]) => {
          return (
            <View key={type}>
              <View row>
                <Text bold caption secondary>{`${type} keys `}</Text>
                <Text tiny>[{qrs.length}]</Text>
              </View>

              <View gap style={style.items}>
                {qrs.map(({ qr, name, timestamp } = {}, index) => {
                  const [type] = qr;

                  return (
                    <Pressable key={`${qr}:${index}`} onPress={() => handlePress(qr, name)}>
                      <View row style={style.item}>
                        <View style={style.thumbnail} />

                        <View flex>
                          <View flex row spaceBetween>
                            <Text bold caption>
                              {name}
                            </Text>
                            <Text color="contentLight" tiny>
                              {new Intl.DateTimeFormat('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }).format(timestamp)}
                            </Text>
                          </View>

                          <Text color="contentLight" tiny>
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
      </ScrollView>

      <View gap style={style.buttons}>
        <Button icon="plus" large rounded color="base" onPress={() => navigation.navigate('create')} />
      </View>
    </Screen>
  );
};

Home.propTypes = {
  navigation: PropTypes.any,
};

export { Home };
