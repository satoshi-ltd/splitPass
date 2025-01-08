import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, Input, Modal, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import { DEFAULT_FORM } from './Create.constants';
import { style } from './Create.style';
import { QR_TYPE } from '../../App.constants';
import { InputMask, Switch } from '../../components';
import { useStore } from '../../contexts';
import { Cypher, QRParser } from '../../modules';
import { PurchaseService } from '../../services';

const { PASSWORD, PASSWORD_ENCRYPTED, SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const Create = ({ navigation = {} }) => {
  const { subscription, updateSubscription } = useStore();
  const [form, setForm] = useState(DEFAULT_FORM);

  useFocusEffect(useCallback(() => setForm({ ...DEFAULT_FORM }), []));

  useEffect(() => {
    setForm({ ...form, passcode: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.split]);

  const handlePressContinue = () => {
    const { name, passcode, secret, split = false } = form;
    const qr = QRParser.encode(secret, !!passcode);
    let values = split ? QRParser.split(qr) : [qr];

    values = values.map((qr, index) => {
      const mustEncrypt = index === 0 && passcode;
      if (!mustEncrypt) return qr;

      let [type, ...digits] = qr;
      if (type === PASSWORD) type = PASSWORD_ENCRYPTED;
      else if (type === SEED_PHRASE) type = SEED_PHRASE_ENCRYPTED;

      return `${type}${Cypher.encrypt(digits.join(''), passcode)}`;
    });

    PurchaseService.checkSubscription(subscription).then((activeSubscription) => {
      if (!activeSubscription) {
        updateSubscription({});
      }
    });

    navigation.goBack();

    setTimeout(() => {
      navigation.navigate('viewer', { name, values });
    }, 10);
  };

  const fieldProps = { row: true, spaceBetween: true, style: style.field };

  const isValid = !!form.name && !!form.secret;

  return (
    <Modal gap onClose={navigation.goBack}>
      <Text align="center" secondary bold title>
        New Secret
      </Text>

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
          <InputMask
            align="right"
            multiline
            placeholder="secret..."
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

        {!form.split && (
          <>
            <View style={style.separator} />

            <View {...fieldProps}>
              <Text bold tiny color={form.split ? 'disabled' : undefined}>
                6-digit passcode
              </Text>
              <InputMask
                align="right"
                editable={!form.split}
                keyboard="numeric"
                maxLength={6}
                placeholder="passcode..."
                value={form.passcode}
                onChange={(passcode) => setForm({ ...form, passcode })}
                style={style.input}
              />
            </View>
          </>
        )}
      </Card>

      <Button disabled={!isValid} secondary onPress={handlePressContinue} style={style.button}>
        Continue
      </Button>
    </Modal>
  );
};

Create.propTypes = {
  navigation: PropTypes.any,
};

export { Create };
