import { Card, Icon, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { ANIMATION } from './NFCCard.constants';
import { style } from './NFCCard.style';
import { ICON } from '../../modules';
import { NFCService } from '../../services';

const NFCCard = ({
  //
  active = false,
  readMode = false,
  writeMode,
  onError = () => {},
  onSecret = () => {},
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
      else if (writeMode) setTag(await NFCService.append(writeMode.value, writeMode.name).catch(handleError));
      // await NFCService.append(new Date().getTime().toString());
    }, ANIMATION.duration);
  }, [active]);

  useEffect(() => {
    const { records = [] } = tag || {};

    if (records.length === 1) return onSecret(records[0]);
    // ! Should ask secrets
    // console.log('::records::', records);
    // onSecret(secrets[0]);
  }, [onSecret, tag]);

  const handleError = (error) => {
    console.error('<NFCCard>:handleError', JSON.stringify(error));
    onError(error);
  };

  const { info: { id, name, totalMemory, usedMemory } = {}, records = [] } = tag || {};
  const textProps = { color: id ? '#000' : 'contentLight' };

  return (
    <>
      <Animated.View style={[{ opacity, transform: [{ translateY }, { scale }] }]}>
        <Card spaceBetween color={id ? 'accent' : undefined} gap style={[style.card]}>
          <View row spaceBetween style={style.row}>
            <Text {...textProps} bold subtitle style={style.logo}>
              split|Card
            </Text>
            {usedMemory && (
              <Text {...textProps} tiny style={style.embossedText}>
                {`${parseInt((usedMemory * 100) / totalMemory)}% Free Memory`}
              </Text>
            )}
          </View>

          <Icon {...textProps} name={ICON.NFC} style={style.icon} />

          <View row spaceBetween style={style.row}>
            <Text {...textProps} tiny style={style.embossedText}>
              {(id || '0'.repeat(16)).match(/.{1,4}/g).join(' ')}
            </Text>
            <Text {...textProps} tiny style={style.embossedText}>
              {name || 'SATOSHI LTD.'}
            </Text>
          </View>
        </Card>
      </Animated.View>

      {readMode && records.length > 1 && <Text>{JSON.stringify(records)}</Text>}
    </>
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
  onSecret: PropTypes.func,
};

export { NFCCard };
