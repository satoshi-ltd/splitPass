import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, Icon, Input, Modal, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { DEFAULT_FORM } from './Create.constants';
import { style } from './Create.style';
import { QR_TYPE } from '../../App.constants';
import { Switch } from '../../components';
import { Cypher, QRParser } from '../../modules';

const { PASSWORD, PASSWORD_ENCRYPTED, SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const Create = ({ navigation = {} }) => {
  const [form, setForm] = useState(DEFAULT_FORM);

  useFocusEffect(
    useCallback(() => {
      setForm({
        ...DEFAULT_FORM,
        name: 'seedsigner 🟠',
        secret: 'roast soon winter over sentence shaft shock side mango select screen neither',
      });
    }, []),
  );

  const handlePressContinue = () => {
    const { name, passphrase, secret, split = false } = form;
    const qr = QRParser.encode(secret);
    let qrs = split ? QRParser.split(qr) : [qr];

    qrs = qrs.map((qr, index) => {
      const mustEncrypt = index === 0 && passphrase;
      if (!mustEncrypt) return qr;

      let [type, ...digits] = qr;
      if (type === PASSWORD) type = PASSWORD_ENCRYPTED;
      else if (type === SEED_PHRASE) type = SEED_PHRASE_ENCRYPTED;

      return `${type}${Cypher.encrypt(digits.join(''), passphrase)}`;
    });

    navigation.goBack();

    setTimeout(() => {
      navigation.navigate('viewer', { qrs, name });
    }, 10);
  };

  const fieldProps = { row: true, spaceBetween: true, style: style.field };

  const isValid = !!form.name && !!form.secret;

  return (
    <Modal gap onClose={navigation.goBack}>
      <Text align="center" secondary bold title>
        New Secret
      </Text>

      {/* <Text align="center" caption secondary>
        Pick amount of Guardians which will be responsible for keepin the Shards of your Secret.
      </Text> */}

      <Card outlined style={style.cardForm}>
        <View {...fieldProps}>
          <Text bold tiny>
            Name
          </Text>
          <Input
            align="right"
            autoFocus
            placeholder="name..."
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
            style={style.input}
          />
        </View>

        <View style={style.separator} />

        <View {...fieldProps}>
          <Text bold tiny>
            Secret
          </Text>
          <Input
            align="right"
            multiline={form.secret?.includes(' ')}
            placeholder="secret..."
            // secureTextEntry
            value={form.secret}
            onChange={(secret) => setForm({ ...form, secret })}
            style={style.input}
          />
        </View>

        <View style={style.separator} />

        <View {...fieldProps}>
          <Text tiny style={{ maxWidth: '85%' }}>
            {`Recover this secret will require the approval of at least `}
            <Text bold tiny>
              2 out of 3
            </Text>
            {` guardians.`}
          </Text>
          <Switch checked={form.split} onChange={(split) => setForm({ ...form, split })} />
        </View>

        <View style={style.separator} />

        <View {...fieldProps}>
          <Text bold tiny>
            6-digit passcode
          </Text>
          <Input
            align="right"
            keyboard="numeric"
            maxLength={6}
            placeholder="passphrase"
            // secureTextEntry
            value={form.passphrase}
            onChange={(passphrase) => setForm({ ...form, passphrase })}
            style={style.input}
          />
        </View>
      </Card>

      {form.split && (
        <Card row color="background" style={style.cardAlert}>
          <Icon color="$colorContent" name="alert" />
          <Text bold tiny style={style.textAlert}>
            {`Recovering this secret will require the approval of at least `}
            <Text bold tiny>
              2 out of 3
            </Text>
            {` guardians.`}
          </Text>
        </Card>
      )}

      <Button disabled={!isValid} secondary onPress={handlePressContinue}>
        Continue
      </Button>
    </Modal>
  );
};

Create.propTypes = {
  navigation: PropTypes.any,
};

export { Create };
