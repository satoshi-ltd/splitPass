import React, { useEffect, useState } from 'react';

import { style } from './GenerateScreen.style';
import { Button, Icon, Input, ScrollView, Switch, Text, View } from '../../__primitives__';
import { GUARDIANS } from '../../App.constants';
import { Card, InputPin, Option } from '../../components';

// eslint-disable-next-line react/prop-types
export const GenerateScreen = ({ navigation: { navigate } = {} }) => {
  const [guardians, setGuardians] = useState(GUARDIANS[1]);
  const [pin, setPin] = useState();
  const [secret, setSecret] = useState('abandon bridge buddy supreme exclude milk consider tail expand wasp pattern');
  const [encrypted, setEncrypted] = useState(false);

  useEffect(() => {
    setEncrypted(guardians === 1);
  }, [guardians]);

  return (
    <ScrollView style={style.screen}>
      <View>
        <Text align="center" bold subtitle>
          Select Guardians amount
        </Text>
        <Text align="center" caption>
          Pick amount of Guardians which will be responsible for keepin the Shards of your Secret.
        </Text>
      </View>

      <Card>
        <View gap row>
          {GUARDIANS.map((amount) => (
            <Option checked={amount === guardians} key={amount} value={amount} onPress={setGuardians}>
              {`${amount} ${amount === 1 ? 'Guardian' : 'Guardians'}`}
            </Option>
          ))}
        </View>

        <View style={style.anchor} />

        <View gap row wide style={style.rowEncryptedShard}>
          <Text color="contentLight" tiny>
            Keep one Shard (encrypted part of the Secret) on this device.
          </Text>
          <Switch checked={encrypted} disabled={guardians === 1} onChange={setEncrypted} />
        </View>
      </Card>

      {encrypted && (
        <Card>
          <Text align="center" bold caption>
            Pin Code
          </Text>
          <InputPin onChange={setPin} />
        </Card>
      )}

      {guardians > 1 && (
        <Card align="center">
          <Icon color="content" name="info" />
          <Text align="center" caption>
            {`Recovering this secret will require the approval of at least `}
            <Text bold>{`${guardians - 1 - (encrypted ? 1 : 0)} out of ${guardians - (encrypted ? 1 : 0)}`}</Text>
            {` guardians.`}
          </Text>
        </Card>
      )}

      <Card outlined>
        <View>
          <Text align="center" bold subtitle>
            Secret
          </Text>
          <Text align="center" caption>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          </Text>
        </View>

        <Input
          align="center"
          multiline
          placeholder="Type your secret..."
          // secureTextEntry
          value={secret}
          onChange={setSecret}
        />
      </Card>

      <Button disabled={!secret} onPress={() => navigate('modal', { pin, secret })}>
        Continue
      </Button>
    </ScrollView>
  );
};
