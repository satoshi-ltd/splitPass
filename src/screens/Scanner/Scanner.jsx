import PropTypes from 'prop-types';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getScannerInstructions, resolveScannerPayload } from './Scanner.helpers';
import { ScannerNFC } from './Scanner.nfc';
import { ScannerFrame, ScannerQR } from './Scanner.qr';
import { style } from './Scanner.style';
import { READER_TYPE, SECURE_TYPES, SHARD_TYPES, SECRET_TYPE } from '../../App.constants';
import { EVENT } from '../../App.constants';
import { SecretFooterContent } from '../../components';
import { useStore } from '../../contexts';
import { Menu, Pressable, Screen, Tabs, Text, View } from '../../design-system';
import {
  deriveSecretVisual,
  eventEmitter,
  getTOTPDisplayName,
  ICON,
  isTOTPURI,
  L10N,
  parseTOTPURI,
  QRParser,
} from '../../modules';
import {
  formatCardNumber,
  getMaskedCardValue,
  isCardValue,
  maskSecret,
  parseCardValue,
} from '../../modules/secretValueDisplay';
const decodeSecret = (value = '', passcode = '') => {
  try {
    return QRParser.decode(value, passcode) || '';
  } catch {
    return '';
  }
};

const Scanner = ({
  navigation,
  route: {
    params: {
      readMode = false,
      readerType: propReaderType = READER_TYPE.QR,
      values: propValues = [],
      writeMode = false,
    } = {},
  },
}) => {
  const { createSecret, deleteSecret } = useStore();

  const [fields, setFields] = useState();
  const [form, setForm] = useState({});
  const [readerType, setReaderType] = useState(propReaderType);
  const [reveal, setReveal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [passcodeDraft, setPasscodeDraft] = useState('');
  const [instructionsHeight, setInstructionsHeight] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  const [unsupportedNoticeAt, setUnsupportedNoticeAt] = useState(0);
  const [values, setValues] = useState([]);

  useEffect(() => {
    handleReaderType(propReaderType);
  }, [propReaderType]);

  useEffect(() => {
    if (readMode && propValues.length) handleScanned(propValues[0]);
  }, [propValues, readMode]);

  const handleReaderType = (next) => {
    setScanning(next === READER_TYPE.QR);
    setReaderType(next);
  };

  const handleScanned = (payload = '') => {
    const resolvedPayload = resolveScannerPayload(payload);

    if (resolvedPayload.kind === 'unsupported') {
      const now = Date.now();

      if (resolvedPayload.scannedValue && now - unsupportedNoticeAt > 1500) {
        setUnsupportedNoticeAt(now);
        eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.SCANNER_UNSUPPORTED_PAYLOAD });
      }

      return;
    }

    if (resolvedPayload.kind === 'totp') {
      const { scannedValue } = resolvedPayload;

      setScanning(false);
      navigation.navigate('create', {
        hydrate: {
          name: getTOTPDisplayName(resolvedPayload.totp),
          notes: payload?.notes,
          secret: scannedValue,
          totp: resolvedPayload.totp,
        },
      });
      return;
    }

    const { scannedValue, type } = resolvedPayload;
    setSelectedItem(typeof payload === 'string' ? undefined : payload);
    setFields();
    setForm((current) => ({ ...current, passcode: '' }));
    setPasscodeDraft('');
    setReveal(false);
    setScanning(false);
    if (SHARD_TYPES.includes(type)) {
      if (values.includes(scannedValue)) {
        return eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.FIRST_SHARD_SAME, variant: 'accent' });
      }

      const nextValues = [...values, scannedValue];

      if (!values.length) {
        eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.FIRST_SHARD_SCANNED, variant: 'accent' });
      } else {
        eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SHARDS_COMBINED, title: L10N.SUCCESS, variant: 'accent' });
      }

      setValues(nextValues);

      if (nextValues.length < 2) setTimeout(() => handleReaderType(readerType), 1000);
      return;
    }

    setValues([scannedValue]);
  };

  const handleReset = () => {
    handleReaderType(readerType);
    setForm({});
    setFields();
    setReveal(false);
    setSelectedItem(undefined);
    setShowFooterMenu(false);
    setPasscodeDraft('');
    setUnsupportedNoticeAt(0);
    setValues([]);
  };

  const [type] = values[0] || [];

  const is = {
    empty: !values.length,
    modeNFC: readerType === READER_TYPE.NFC,
    secure: SECURE_TYPES.includes(type),
    shard: SHARD_TYPES.includes(type),
    complete: values.length > 0 && (!SHARD_TYPES.includes(type) || values.length > 1),
  };

  const combinedValue = is.complete ? QRParser.combine(...values) : '';
  const decodedSecret = !combinedValue ? '' : decodeSecret(combinedValue, form.passcode);
  const maskedFooterValue = maskSecret(decodedSecret || '••••••••••••');
  const isCard =
    [SECRET_TYPE.CARD, SECRET_TYPE.CARD_SECURE, SECRET_TYPE.CARD_SHARD].includes(type) || isCardValue(decodedSecret);
  const isTotp = type === SECRET_TYPE.TOTP || (!isCard && isTOTPURI(decodedSecret));
  const cardValue = isCard ? parseCardValue(decodedSecret) : undefined;
  const footerCardValue = !cardValue
    ? undefined
    : reveal
    ? {
        cvv: cardValue.cvv,
        expire: cardValue.expire,
        number: formatCardNumber(cardValue.number),
      }
    : getMaskedCardValue(cardValue.canonical);
  const isSeed = !isCard && /\s/.test(decodedSecret);
  const footerValue = reveal ? decodedSecret : maskedFooterValue;
  const showPasscodePrompt = fields?.includes('passcode');
  const showFooter = showPasscodePrompt || !is.empty;
  const verticalOffset = Math.round(instructionsHeight / 2);
  const { caption: instructionCaption, title: instructionTitle } = getScannerInstructions({
    readerType,
    showPasscodePrompt,
    values,
  });
  const shardLabel =
    is.shard && !is.complete
      ? L10N.SCANNER_SHARD_PROGRESS_LABEL({ current: Math.min(values.length, 2), total: 2 })
      : L10N.SECRET_TYPE_SHARD;

  const resolveFallbackName = (secretType) => {
    if ([SECRET_TYPE.CARD, SECRET_TYPE.CARD_SECURE, SECRET_TYPE.CARD_SHARD].includes(secretType))
      return L10N.SECRET_TYPE_CARD;
    if (secretType === SECRET_TYPE.TOTP) return L10N.SECRET_TYPE_TOTP;
    if ([SECRET_TYPE.SEED_PHRASE, SECRET_TYPE.SEED_PHRASE_SECURE].includes(secretType))
      return L10N.SECRET_TYPE_SEED_PHRASE;
    if ([SECRET_TYPE.PASSWORD, SECRET_TYPE.PASSWORD_SECURE].includes(secretType)) return L10N.SECRET_TYPE_PASSWORD;

    return L10N.SECRET_TYPE_SHARD;
  };

  useEffect(() => {
    if (values.length > 0 && is.secure && is.complete && !form.passcode) {
      setFields(['passcode']);
    }
  }, [form.passcode, is.complete, is.secure, values.length]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text bold size="xl" tone="onAccent">
          Scanner
        </Text>
      ),
      headerRight: () => (
        <View style={style.headerTabs}>
          <Tabs
            compact
            selected={readerType === READER_TYPE.QR ? 0 : 1}
            options={[
              { icon: ICON.QRCODE, text: 'QR', type: READER_TYPE.QR },
              { icon: ICON.NFC, text: 'NFC', type: READER_TYPE.NFC },
            ]}
            onChange={({ type: next }) => handleReaderType(next)}
          />
        </View>
      ),
    });
  }, [navigation, readerType]);

  const handleSaveToPhone = async () => {
    if (!values.length) return;
    if (!is.shard && !decodedSecret) return;

    const visual =
      is.complete && decodedSecret ? deriveSecretVisual({ name: selectedItem?.name, secret: decodedSecret }) : {};
    const persistedValue =
      is.shard || !is.complete
        ? values[0]
        : QRParser.encode(decodedSecret, isCard ? { type: 'card' } : isTotp ? { type: 'totp' } : false);
    const parsedTOTP = isTotp ? parseTOTPURI(decodedSecret) : undefined;
    const savedSecret = await createSecret({
      brand: visual.brand,
      account: parsedTOTP?.account,
      algorithm: parsedTOTP?.algorithm,
      cardNumber: cardValue?.number,
      cvv: cardValue?.cvv,
      digits: parsedTOTP?.digits,
      expire: cardValue?.expire,
      issuer: parsedTOTP?.issuer,
      kind: is.shard
        ? 'shard'
        : [SECRET_TYPE.CARD, SECRET_TYPE.CARD_SECURE, SECRET_TYPE.CARD_SHARD].includes(type)
        ? 'card'
        : isTotp
        ? 'totp'
        : visual.kind,
      period: parsedTOTP?.period,
      name: selectedItem?.name || (parsedTOTP ? getTOTPDisplayName(parsedTOTP) : resolveFallbackName(type)),
      notes: selectedItem?.notes,
      username: selectedItem?.username,
      value: persistedValue,
    });
    if (!savedSecret) return;

    eventEmitter.emit(EVENT.NOTIFICATION, {
      text: L10N.SECRET_SAVED_IN_DEVICE,
      title: L10N.SUCCESS,
      variant: 'accent',
    });
    handleReset();
  };

  const handleCancelPasscode = () => {
    handleReset();
  };

  const handlePasscodeChange = (nextValue = '') => {
    setPasscodeDraft(`${nextValue}`.replace(/\D/g, ''));
  };

  const handleSubmitPasscode = () => {
    if (passcodeDraft.length !== 6) return;

    const nextDecodedSecret = decodeSecret(combinedValue, passcodeDraft);

    if (!nextDecodedSecret) {
      setPasscodeDraft('');
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.SCANNER_PASSCODE_INVALID });
      return;
    }

    setForm((current) => ({ ...current, passcode: passcodeDraft }));
    setFields();
    setReveal(false);
  };

  const handleToggleReveal = () => {
    if (!is.complete) return;

    if (is.secure && !form.passcode) {
      setFields(['passcode']);
      return;
    }

    setReveal((current) => !current);
  };

  const handleDeleteCurrent = async () => {
    setShowFooterMenu(false);

    if (selectedItem?.tagId && selectedItem?.name) {
      selectedItem.onDelete?.();
      return;
    }

    if (!selectedItem?.hash) return;

    await deleteSecret({ hash: selectedItem.hash });
    eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_DELETED, title: L10N.SUCCESS, variant: 'accent' });
    handleReset();
  };

  const footerMenuOptions = [
    !readMode && values.length === 1
      ? {
          icon: ICON.DATABASE_ADD,
          onPress: handleSaveToPhone,
          text: L10N.SAVE_IN_DEVICE,
        }
      : null,
    selectedItem
      ? {
          critical: true,
          icon: ICON.DATABASE_REMOVE,
          onPress: handleDeleteCurrent,
          text: L10N.DELETE_SECRET,
        }
      : null,
    {
      icon: ICON.REFRESH,
      onPress: handleReset,
      text: L10N.RESTART,
    },
  ].filter(Boolean);

  const handleContinueShardScan = () => {
    setShowFooterMenu(false);
    handleReaderType(readerType);
  };

  return (
    <Screen disableScroll style={style.screen}>
      <KeyboardAvoidingView behavior="padding" style={style.keyboard}>
        <View style={style.container}>
          {!is.modeNFC && <ScannerQR camera onRead={handleScanned} scanning={scanning} />}

          <View
            align="center"
            style={[style.instructions, style.background]}
            onLayout={({ nativeEvent: { layout } }) => {
              const nextHeight = Math.round(layout?.height || 0);

              setInstructionsHeight((current) => (current === nextHeight ? current : nextHeight));
            }}
          >
            <Text align="center" bold size="l" tone="onInverse" style={style.instructionsContent}>
              {instructionTitle}
            </Text>
            <Text align="center" size="s" tone="onInverse" style={style.instructionsContent}>
              {instructionCaption}
            </Text>
          </View>

          <View
            align="center"
            flex
            style={[style.stage, is.modeNFC && style.background]}
            onLayout={({ nativeEvent: { layout } }) => {
              const nextHeight = Math.round(layout?.height || 0);

              setStageHeight((current) => (current === nextHeight ? current : nextHeight));
            }}
          >
            {is.modeNFC ? (
              <ScannerNFC onRead={handleScanned} verticalOffset={verticalOffset} writeMode={writeMode} />
            ) : (
              <ScannerFrame stageHeight={stageHeight} verticalOffset={verticalOffset} />
            )}
          </View>

          {showFooter ? (
            <View style={[style.footer, style.footerAccent]}>
              <SafeAreaView edges={['bottom']} style={style.footerSafeArea}>
                <View style={style.footerInner}>
                  <SecretFooterContent
                    cardValue={footerCardValue}
                    contrast="accent"
                    isCard={isCard}
                    isSeed={isSeed}
                    mode={showPasscodePrompt ? 'passcode' : is.shard && !is.complete ? 'shard' : 'value'}
                    onMenu={() => setShowFooterMenu((current) => !current)}
                    onPasscodeCancel={handleCancelPasscode}
                    onPasscodeChange={handlePasscodeChange}
                    onPasscodeSubmit={handleSubmitPasscode}
                    onShardAction={is.shard && !is.complete ? handleContinueShardScan : undefined}
                    onToggleReveal={handleToggleReveal}
                    passcodePlaceholder={L10N.PASSCODE_PLACEHOLDER}
                    passcodeValue={passcodeDraft}
                    revealIcon={is.secure && !form.passcode ? ICON.PASSCODE : reveal ? ICON.EYE_OFF : ICON.EYE}
                    shardCaption={is.shard && !is.complete ? L10N.SHARD_SCAN_CAPTION : undefined}
                    shardLabel={shardLabel}
                    showMenu={!showPasscodePrompt && !is.empty}
                    showReveal={is.complete && !showPasscodePrompt && !is.empty}
                    valueCaption={
                      !showPasscodePrompt && is.complete && !is.shard ? L10N.SCANNER_SECRET_READY_CAPTION : undefined
                    }
                    value={footerValue}
                  />

                  {showFooterMenu ? (
                    <>
                      <Pressable onPress={() => setShowFooterMenu(false)} style={style.footerMenuBackdrop} />
                      <View style={style.footerMenuWrap}>
                        <Menu onClose={() => setShowFooterMenu(false)} options={footerMenuOptions} />
                      </View>
                    </>
                  ) : null}
                </View>
              </SafeAreaView>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

Scanner.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Scanner };
