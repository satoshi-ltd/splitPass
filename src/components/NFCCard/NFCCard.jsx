import { Card, Icon, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { ANIMATION } from './NFCCard.constants';
import { style } from './NFCCard.style';
import { EVENT } from '../../App.constants';
import { eventEmitter, findVault, ICON, L10N } from '../../modules';
import { NFCService } from '../../services';

const NFCCard = ({
  active = false,
  readMode = false,
  writeMode,
  onError = () => {},
  onRead = () => {},
  onRecord = () => {},
}) => {
  const opacity = useRef(new Animated.Value(0.8)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  const [tag, setTag] = useState();

  useEffect(() => {
    setTag();
    Animated.parallel([
      Animated.timing(opacity, { ...ANIMATION, toValue: active ? 1 : 0.8 }),
      Animated.timing(scale, { ...ANIMATION, toValue: active ? 1 : 0.9 }),
      Animated.timing(translateY, { ...ANIMATION, toValue: active ? 0 : 16 }),
    ]).start();

    if (!active) return;

    setTimeout(async () => {
      if (readMode) setTag(await NFCService.read().catch(handleError));
      else if (writeMode) setTag(await NFCService.write(writeMode.value, writeMode.name).catch(handleError));
    }, ANIMATION.duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, readMode, writeMode]);

  useEffect(() => {
    if (!tag) return;

    const { records = [] } = tag || {};
    onRead(tag);
    if (readMode && records.length === 1) handleRecord(records[0].value);
    if (writeMode) eventEmitter.emit(EVENT.NOTIFICATION, { message: L10N.SECRET_SAVED_IN_NFC });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const handleError = (error) => {
    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, message: error });
    onError(error);
  };

  const handleRecord = (record) => {
    onRecord(record);
    // !TODO
    setTag();
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
        <Card spaceBetween color={id ? 'accent' : undefined} gap style={[style.card]}>
          <View row spaceBetween style={style.cardRow}>
            <Text color={color} bold subtitle>
              split|Card
            </Text>
            {id && (
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
  active: PropTypes.bool,
  readMode: PropTypes.bool,
  writeMode: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  }),
  onError: PropTypes.func,
  onRead: PropTypes.func,
  onRecord: PropTypes.func,
};

export { NFCCard };
