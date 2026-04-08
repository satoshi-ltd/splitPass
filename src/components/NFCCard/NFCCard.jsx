/* global __DEV__ */

import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { ANIMATION } from './NFCCard.constants';
import { style } from './NFCCard.style';
import { EVENT, SECRET_TYPE, SECURE_TYPES, SHARD_TYPES } from '../../App.constants';
import { Button, Card, Icon, Pressable, ScrollView, Text, View } from '../../design-system';
import { eventEmitter, ICON, L10N, openConfirm, QRParser, resolveSecretIcon } from '../../modules';
import { isCardValue } from '../../modules/secretValueDisplay';
import { buildNfcMockWrittenTag, NFC_MOCK_TAG, NFCService, SecurityService } from '../../services';
import { getAppColors } from '../../theme';

const scannerColors = getAppColors('light');

const getRecordMeta = ({ name = '', value = '' } = {}) => {
  const [type] = value;
  const secure = SECURE_TYPES.includes(type);
  const shard = SHARD_TYPES.includes(type);
  const card = [SECRET_TYPE.CARD, SECRET_TYPE.CARD_SECURE, SECRET_TYPE.CARD_SHARD].includes(type);
  const decoded = !secure && !shard ? QRParser.decode(value) : '';
  const icon = shard
    ? ICON.SHARD
    : card || isCardValue(decoded)
    ? 'credit-card-outline'
    : resolveSecretIcon({
        name,
        secret: decoded,
        type: secure ? ICON.SECURE : ICON.QRCODE,
      });

  return {
    icon,
    subtitle: shard
      ? L10N.SECRET_TYPE_SHARD
      : card
      ? L10N.SECRET_TYPE_CARD
      : secure
      ? L10N.SECRET_TYPE_SECURE
      : L10N.SECRET,
  };
};

const NFCCard = ({ readMode = false, showHeader = true, writeMode = false, onRecord = () => {} }) => {
  const navigation = useNavigation();
  const opacity = useRef(new Animated.Value(0.8)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  const [active, setActive] = useState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [tag, setTag] = useState();

  const resolveErrorMessage = (error) => error?.message || error?.error || error || L10N.NFC_ACCESS_ERROR;

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
        const nextTag = await NFCService.read().catch((error) => {
          const message = resolveErrorMessage(error);

          if (__DEV__ && message === L10N.NFC_NOT_SUPPORTED) return NFC_MOCK_TAG;

          return handleError(message);
        });
        read(nextTag);
      } else if (writeMode) {
        const nextTag = await NFCService.write(
          writeMode.value,
          writeMode.name,
          writeMode.username,
          writeMode.notes,
        ).catch((error) => {
          const message = resolveErrorMessage(error);

          if (__DEV__ && message === L10N.NFC_NOT_SUPPORTED) return buildNfcMockWrittenTag(writeMode);

          return handleError(message);
        });
        setTag(nextTag);
      }
      setBusy(false);
    }, ANIMATION.duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, readMode, writeMode]);

  useEffect(() => {
    if (!tag) return;

    const { records = [] } = tag || {};
    if (readMode && records.length === 1) handleRecord(records[0]);
    if (writeMode)
      eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_SAVED_IN_NFC, title: L10N.SUCCESS, variant: 'accent' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const handleError = (error) => {
    const message = resolveErrorMessage(error);

    setError(message);
    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: message, variant: 'accent' });
  };

  const handleRecord = ({ name, notes, value, username }) => {
    onRecord({
      name,
      notes,
      onDelete: () => handleDelete({ name, notes, value, username }),
      tagId: tag?.info?.id,
      username,
      value,
    });
    setTag();
  };

  const handleActive = () => {
    setActive(false);
    setBusy(true);
    setTimeout(() => setActive(true), 300);
  };

  const handleDelete = ({ name, notes, value, username }) => {
    openConfirm(
      navigation,
      {
        caption: L10N.NFC_REMOVE_CONFIRM,
        title: L10N.DELETE_SECRET_TITLE,
      },
      {
        onAccept: async () => {
          eventEmitter.emit(EVENT.NOTIFICATION, {
            text: L10N.NFC_REMOVE_SCAN_AGAIN,
            title: L10N.NFC_CARD,
            variant: 'accent',
          });
          const nextTag = await NFCService.remove(value, name, tag.info.id, username, notes).catch(handleError);
          read(nextTag);
          eventEmitter.emit(EVENT.NOTIFICATION, {
            text: L10N.SECRET_DELETED,
            title: L10N.SUCCESS,
            variant: 'accent',
          });
        },
      },
    );
  };

  const read = async (nextTag) => {
    const valid = await SecurityService.checkCard({ tag: nextTag }).catch();

    if (!valid)
      return eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.NFC_SPLITCARD_ERROR, variant: 'accent' });
    if (nextTag?.records?.length === 0)
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.NFC_CARD_IS_EMPTY, variant: 'accent' });

    setTag(nextTag);
  };

  const { info: { id, name, totalMemory, usedMemory } = {}, records = [] } = tag || {};
  const cardTextColor = scannerColors.qrForeground;
  const cardMetaColor = scannerColors.qrForeground;
  const actionText = error ? L10N.SCANNER_NFC_ERROR : busy ? L10N.SCANNER_NFC_BUSY : tag ? '' : L10N.SCANNER_NFC_SCAN;

  return (
    <View align="center">
      {showHeader ? (
        <View align="center" style={style.header}>
          <Text align="center" bold size="xl" tone="secondary" style={[style.instructionsContent, style.text]}>
            {L10N.SCANNER_NFC}
          </Text>
          <Text align="center" size="s" tone="secondary" style={style.instructionsContent}>
            {L10N.SCANNER_NFC_CAPTION}
          </Text>
        </View>
      ) : null}

      <Animated.View style={[{ opacity, transform: [{ translateY }, { scale }] }]}>
        <Card
          spaceBetween
          color={id ? 'accent' : undefined}
          gap
          style={[
            style.card,
            !id ? { backgroundColor: scannerColors.qrBackground, borderColor: scannerColors.border } : null,
          ]}
          onPress={handleActive}
        >
          <View row spaceBetween style={style.cardRow}>
            <Text bold size="l" style={{ color: cardTextColor }}>
              split/Card
            </Text>
            {id && usedMemory > 0 && (
              <View row style={[style.cardMemory, { backgroundColor: scannerColors.qrBackground }]}>
                <Icon name={ICON.MEMORY} size="s" style={{ color: cardTextColor }} />
                <Text bold size="xs" style={{ color: cardTextColor }}>
                  {usedMemory > 0 ? `${parseInt((usedMemory * 100) / totalMemory)}%` : ''}
                </Text>
              </View>
            )}
          </View>

          <Icon name={ICON.NFC} style={[style.cardIcon, { color: cardTextColor }]} />

          <View row spaceBetween style={style.cardRow}>
            <Text size="xs" style={[style.cardEmbossedText, { color: cardMetaColor }]}>
              {(id || '0'.repeat(14)).match(/.{1,4}/g).join(' ')}
            </Text>
            <Text size="xs" style={[style.cardEmbossedText, { color: cardMetaColor }]}>
              {name || 'SATOSHI LTD.'}
            </Text>
          </View>
        </Card>
      </Animated.View>

      {actionText ? (
        <Pressable onPress={handleActive} style={style.action}>
          <Text bold size="s" style={{ color: scannerColors.onInverse, opacity: 0.72 }}>
            {actionText}
          </Text>
        </Pressable>
      ) : null}

      {readMode && records.length ? (
        <View style={style.records}>
          <ScrollView>
            {records.map(({ name, notes, value, username }, index) => {
              const { icon, subtitle } = getRecordMeta({ name, value });

              return (
                <Pressable
                  key={index}
                  onPress={() => handleRecord({ name, notes, value, username })}
                  style={style.record}
                >
                  <View style={[style.recordThumb, { backgroundColor: scannerColors.surface }]}>
                    <Icon name={icon} style={{ color: scannerColors.qrForeground }} />
                  </View>

                  <View flex style={style.recordBody}>
                    <Text semibold ellipsizeMode="tail" numberOfLines={1} style={{ color: scannerColors.onInverse }}>
                      {name}
                    </Text>
                    <Text numberOfLines={1} size="xs" style={{ color: scannerColors.onInverse, opacity: 0.72 }}>
                      {subtitle}
                    </Text>
                  </View>

                  <Button
                    icon={ICON.DATABASE_REMOVE}
                    tone="onAccent"
                    size="s"
                    onPress={() => {
                      handleDelete({ name, value, username });
                    }}
                    variant="outlined"
                    style={style.recordDelete}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

NFCCard.propTypes = {
  readMode: PropTypes.bool,
  showHeader: PropTypes.bool,
  writeMode: PropTypes.shape({
    name: PropTypes.string,
    notes: PropTypes.string,
    username: PropTypes.string,
    value: PropTypes.string,
  }),
  onRecord: PropTypes.func,
};

export { NFCCard };
