import { Action, Card, Icon, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { ANIMATION } from './NFCCard.constants';
import { style } from './NFCCard.style';
import { EVENT } from '../../App.constants';
import { useStore } from '../../contexts';
import { eventEmitter, findVault, ICON, L10N } from '../../modules';
import { NFCService } from '../../services';

const NFCCard = ({ readMode = false, writeMode = false, onRecord = () => {} }) => {
  const opacity = useRef(new Animated.Value(0.8)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const { settings: { theme } = {}, subscription } = useStore();

  const isPremium = !!subscription?.productIdentifier;

  const [active, setActive] = useState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [tag, setTag] = useState();

  useEffect(() => {
    setTag();
    Animated.parallel([
      Animated.timing(opacity, { ...ANIMATION, toValue: active ? 1 : 0.8 }),
      Animated.timing(scale, { ...ANIMATION, toValue: active ? 1 : 0.9 }),
      Animated.timing(translateY, { ...ANIMATION, toValue: active ? 0 : 8 }),
    ]).start();

    if (!active) return;

    setBusy(true);
    setTimeout(async () => {
      setError();
      if (readMode) {
        const nextTag = await NFCService.read().catch(handleError);

        if (!isPremium) {
          const response = await fetch('https://splitpass.clonara.com/cards/valid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tagId: nextTag?.info?.id }),
          });
          const data = await response.json();

          if (!data.isValid) {
            return eventEmitter.emit(EVENT.NOTIFICATION, { error: true, message: L10N.NFC_SPLITCARD_ERROR });
          }
        }

        if (nextTag?.records?.length === 0) eventEmitter.emit(EVENT.NOTIFICATION, { message: L10N.NFC_CARD_IS_EMPTY });
        setTag(nextTag);
      } else if (writeMode) setTag(await NFCService.write(writeMode.value, writeMode.name).catch(handleError));
      setBusy(false);
    }, ANIMATION.duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, readMode, writeMode]);

  useEffect(() => {
    if (!tag) return;

    const { records = [] } = tag || {};
    if (readMode && records.length === 1) handleRecord(records[0].value);
    if (writeMode) eventEmitter.emit(EVENT.NOTIFICATION, { message: L10N.SECRET_SAVED_IN_NFC });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const handleError = (error) => {
    setError(error);
    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, message: error });
  };

  const handleRecord = (record) => {
    onRecord(record);
    setTag();
  };

  const handleActive = () => {
    setActive(false);
    setBusy(true);
    setTimeout(() => setActive(true), 300);
  };

  const { info: { id, name, totalMemory, usedMemory } = {}, records = [] } = tag || {};
  const color = id ? '#000' : 'contentLight';

  return (
    <View align="center">
      <View align="center" style={style.header}>
        <Text align="center" bold secondary title style={[style.instructionsContent, style.text]}>
          {L10N.SCANNER_NFC}
        </Text>
        <Text align="center" caption color="contentLight" style={style.instructionsContent}>
          {L10N.SCANNER_NFC_CAPTION}
        </Text>
      </View>

      <Animated.View style={[{ opacity, transform: [{ translateY }, { scale }] }]}>
        <Card spaceBetween color={id ? 'accent' : undefined} gap style={style.card} onPress={handleActive}>
          <View row spaceBetween style={style.cardRow}>
            <Text color={color} bold subtitle>
              split|Card
            </Text>
            {id && usedMemory > 0 && (
              <View row style={style.cardMemory}>
                <Icon color={color} caption name={ICON.MEMORY} />
                <Text bold color={color} tiny>
                  {usedMemory > 0 ? `${parseInt((usedMemory * 100) / totalMemory)}%` : ''}
                </Text>
              </View>
            )}
          </View>

          <Icon color={color} name={ICON.NFC} style={style.cardIcon} />

          <View row spaceBetween style={style.cardRow}>
            <Text color={color} tiny style={style.cardEmbossedText}>
              {(id || '0'.repeat(14)).match(/.{1,4}/g).join(' ')}
            </Text>
            <Text color={color} tiny style={style.cardEmbossedText}>
              {name || 'SATOSHI LTD.'}
            </Text>
          </View>
        </Card>
      </Animated.View>

      <Action
        caption
        color={tag || busy ? 'contentLight' : theme === 'light' ? 'content' : undefined}
        onPress={handleActive}
        style={style.action}
      >
        {error
          ? L10N.SCANNER_NFC_ERROR
          : busy
          ? L10N.SCANNER_NFC_BUSY
          : tag
          ? writeMode
            ? L10N.SCANNER_NFC_WRITE
            : L10N.SCANNER_NFC_RESCAN
          : L10N.SCANNER_NFC_SCAN}
      </Action>

      {readMode && records.length ? (
        <View style={style.records}>
          <View style={[style.gradient, style.gradientTop]} />
          <ScrollView>
            {records.map(({ name, value }, index) => (
              <Card key={index} row onPress={() => handleRecord(value)} style={style.record}>
                <View row>
                  <Icon name={ICON.NFC} />
                  <Text bold caption ellipsizeMode style={style.recordName}>
                    {name}
                  </Text>
                  <Text color="contentLight" tiny>
                    {findVault({ name })}
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
          <View style={[style.gradient, style.gradientBottom]} />
        </View>
      ) : null}
    </View>
  );
};

NFCCard.propTypes = {
  readMode: PropTypes.bool,
  writeMode: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  }),
  onRecord: PropTypes.func,
};

export { NFCCard };
