import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, Icon, Input, Modal, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import { DEFAULT_FORM } from './Create.constants';
import { style } from './Create.style';
import { SECRET_TYPE } from '../../App.constants';
import { InputMask, Switch } from '../../components';
import { useStore } from '../../contexts';
import { ICON, isSeedPhrase, L10N, Cypher, QRParser } from '../../modules';
import { PurchaseService } from '../../services';

const { PASSWORD, PASSWORD_ENCRYPTED, PASSWORD_SHARD, SEED_PHRASE, SEED_PHRASE_ENCRYPTED, SEED_PHRASE_SHARD } =
  SECRET_TYPE;

const Create = ({ navigation = {} }) => {
  const { secrets, subscription, updateSubscription } = useStore();
  const [form, setForm] = useState(DEFAULT_FORM);

  const isPremium = !!subscription?.productIdentifier;

  useFocusEffect(useCallback(() => setForm({ ...DEFAULT_FORM }), []));

  useEffect(() => {
    setForm({ ...form, passcode: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.split]);

  const handlePressContinue = () => {
    const { name, passcode, secret, split = false } = form;

    const shardSecretsLength = secrets.filter((s) => [PASSWORD_SHARD, SEED_PHRASE_SHARD].includes(s.value[0])).length;
    if (!isPremium && form.split && shardSecretsLength >= 2) {
      return PurchaseService.getProducts()
        .then((plans) => {
          navigation.navigate('subscription', { plans });
        })
        .catch((error) => alert(error));
    }

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

  const isValid = !!form.name && !!form.secret && (form.passcode?.length === 0 || form.passcode?.length === 6);

  return (
    <Modal gap onClose={navigation.goBack}>
      <Text align="center" secondary bold title>
        {L10N.NEW_SECRET}
      </Text>

      <Card outlined style={style.cardForm}>
        <View {...fieldProps}>
          <Text bold tiny>
            {L10N.NAME}
          </Text>
          <Input
            align="right"
            autoFocus
            placeholder={L10N.NAME_PLACEHOLDER}
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
            style={style.input}
          />
        </View>

        <View style={style.separator} />

        <View {...fieldProps}>
          <Text bold tiny>
            {L10N.SECRET}
          </Text>
          <InputMask
            align="right"
            multiline
            placeholder={L10N.SECRET_PLACEHOLDER}
            value={form.secret}
            onChange={(secret) => setForm({ ...form, secret })}
            style={style.input}
          />
        </View>

        {isSeedPhrase(form.secret) && (
          <View row style={style.hint}>
            <Icon name={ICON.INFO} />
            <Text tiny>{L10N.SEED_PHRASE_DETECTED}</Text>
          </View>
        )}

        <View style={style.separator} />

        <View {...fieldProps}>
          <Text tiny style={{ maxWidth: '85%' }}>
            {L10N.SHARD_EXPLANATION}
            <Text bold tiny>
              {L10N.SHARD_EXPLANATION_NUMBER}
            </Text>
            {L10N.SHARD_EXPLANATION_GUARDIANS}
          </Text>
          <Switch checked={form.split} onChange={(split) => setForm({ ...form, split })} />
        </View>

        {!form.split && (
          <>
            <View style={style.separator} />

            <View {...fieldProps}>
              <Text bold tiny color={form.split ? 'disabled' : undefined}>
                {L10N.PASSCODE}
              </Text>
              <InputMask
                align="right"
                editable={!form.split}
                keyboard="numeric"
                maxLength={6}
                placeholder={L10N.PASSCODE_PLACEHOLDER}
                value={form.passcode}
                onChange={(passcode) => setForm({ ...form, passcode })}
                style={style.input}
              />
            </View>
          </>
        )}
      </Card>

      <Button disabled={!isValid} secondary onPress={handlePressContinue} style={style.button}>
        {L10N.CONTINUE}
      </Button>
    </Modal>
  );
};

Create.propTypes = {
  navigation: PropTypes.any,
};

export { Create };
