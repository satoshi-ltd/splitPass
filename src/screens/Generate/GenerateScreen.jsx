import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';

import { style } from './GenerateScreen.style';
import { Button, Icon, Input, Switch, Text, View } from '../../__primitives__';
import { GUARDIANS, QR_TYPE } from '../../App.constants';
import { Card, InputPin, Option, Screen } from '../../components';
import { Cypher, isSeedPhrase, QRParser } from '../../helpers';

const { PASSWORD, PASSWORD_ENCRYPTED, SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

// eslint-disable-next-line react/prop-types
export const GenerateScreen = ({ navigation: { navigate } = {} }) => {
  const [encrypted, setEncrypted] = useState(false);
  const [guardians, setGuardians] = useState(GUARDIANS[1]);
  const [pin, setPin] = useState();
  const [secret, setSecret] = useState('roast soon winter over sentence shaft shock side mango select screen neither');

  useEffect(() => setEncrypted(guardians === 1), [guardians]);

  useEffect(() => setPin(), [encrypted]);

  useFocusEffect(
    useCallback(() => {
      setEncrypted(false);
      setGuardians(GUARDIANS[1]);
      setPin();
      setSecret();
    }, []),
  );

  const handlePressContinue = () => {
    const qr = QRParser.encode(secret);
    let qrs = guardians === 1 ? [qr] : QRParser.split(qr);

    qrs = qrs.map((qr, index) => {
      const mustEncrypt = index === 0 && encrypted;
      if (!mustEncrypt) return qr;

      let [type, ...digits] = qr;
      if (type === PASSWORD) type = PASSWORD_ENCRYPTED;
      else if (type === SEED_PHRASE) type = SEED_PHRASE_ENCRYPTED;

      return `${type}${Cypher.encrypt(digits.join(''), pin)}`;
    });

    navigate('modal', { qrs });
  };

  return (
    <Screen>
      <View>
        <Text align="center" bold subtitle>
          Select Guardians amount
        </Text>
        <Text align="center" caption>
          Pick amount of Guardians which will be responsible for keepin the Shards of your Secret.
        </Text>
      </View>

      <Card>
        <View row>
          {GUARDIANS.map((amount) => (
            <Option
              checked={amount === guardians}
              disabled={amount === 5}
              key={amount}
              value={amount}
              onPress={setGuardians}
            >
              {`${amount} ${amount === 1 ? 'Guardian' : `Guardians`}`}
            </Option>
          ))}
        </View>

        <View style={style.anchor} />

        <View row spaceBetween style={style.rowSecure}>
          <Text color="contentLight" tiny style={style.textGuardiansHint}>
            {guardians === 1
              ? `If you don't shard the secret, it will be securely encrypted on this device.`
              : `Keep one shard of the secret securely encrypted on this device.`}
          </Text>
          {guardians > 1 && <Switch checked={encrypted} disabled={guardians === 1} onChange={setEncrypted} />}
        </View>
      </Card>

      {guardians > 1 && (
        <Card align="center" style={style.reduceGap}>
          <Icon color="content" name="alert" />
          <Text align="center" caption>
            {`Recovering this secret will require the approval of at least `}
            <Text bold caption>{`${guardians - 1 - (encrypted ? 1 : 0)} out of ${
              guardians - (encrypted ? 1 : 0)
            }`}</Text>
            {` guardians.`}
          </Text>
        </Card>
      )}

      {encrypted && (
        <Card outlined style={style.reduceGap}>
          <Text align="center" bold>
            Pin Code
          </Text>
          <InputPin onChange={setPin} />
        </Card>
      )}

      <Card outlined style={style.reduceGap}>
        <Text align="center" bold>
          Secret
        </Text>
        <View>
          <Input align="center" multiline placeholder="Type your secret..." value={secret} onChange={setSecret} />
          <Text align="right" tiny>{`isSeedPhrase ${isSeedPhrase(secret)}`}</Text>
        </View>
      </Card>

      <Button disabled={!secret || (encrypted && !pin)} onPress={handlePressContinue}>
        Continue
      </Button>
    </Screen>
  );
};
