import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { style } from './Viewer.style';
import { EVENT, READER_TYPE, SECRET_TYPE, SECURE_TYPES, SHARD_TYPES } from '../../App.constants';
import { QR, SecretFooterContent } from '../../components';
import { useApp, useStore } from '../../contexts';
import {
  AppScreen,
  HeaderBackButton,
  Icon,
  Menu,
  Pagination,
  Pressable,
  ScrollView,
  Text,
  View,
} from '../../design-system';
import { eventEmitter, ICON, L10N, openConfirm, QRParser } from '../../modules';
import {
  formatCardNumber,
  getMaskedCardValue,
  isCardValue,
  maskSecret,
  parseCardValue,
} from '../../modules/secretValueDisplay';

const QR_SIZE = 272;
const LOCKED_QR_PREVIEW_VALUE = 'splitpass://locked-preview/easter-egg';

const decodeSecret = (value = '', passcode = '') => {
  try {
    return QRParser.decode(value, passcode) || '';
  } catch {
    return '';
  }
};

const serializeRouteDate = (value) =>
  value && typeof value === 'object' && typeof value.toISOString === 'function' ? value.toISOString() : value;

const Viewer = ({ route, navigation = {} }) => {
  const {
    params: {
      brand,
      hash,
      favorite: propFavorite = false,
      kind,
      name,
      passcode: initialPasscode = '',
      readMode = false,
      returnToMain = false,
      values = [],
      website,
    } = {},
  } = route || {};
  const insets = useSafeAreaInsets();
  const qrRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { colors, formatDate, theme } = useApp();
  const { createSecret, deleteSecret, readSecret, updateSecret } = useStore();
  const { width } = useWindowDimensions();

  const [favorite, setFavorite] = useState(propFavorite);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passcode, setPasscode] = useState(initialPasscode);
  const [passcodeDraft, setPasscodeDraft] = useState('');
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const currentValue = values[currentIndex] || values[0] || '';
  const [type] = currentValue;
  const isCardType = [SECRET_TYPE.CARD, SECRET_TYPE.CARD_SECURE, SECRET_TYPE.CARD_SHARD].includes(type);

  const is = {
    secure: SECURE_TYPES.includes(type),
    shard: SHARD_TYPES.includes(type),
  };

  const decodedSecret = useMemo(() => {
    if (is.shard) return `shard:${currentIndex + 1}`;
    return decodeSecret(currentValue, passcode);
  }, [currentIndex, currentValue, is.shard, passcode]);
  const [previousReadAt, setPreviousReadAt] = useState(() => serializeRouteDate(route?.params?.readAt));
  const lastOpenedLabel = previousReadAt
    ? L10N.LAST_OPENED({
        value: formatDate(new Date(previousReadAt), {
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      })
    : L10N.NEVER_OPENED;

  const footerSecret = revealed && decodedSecret ? decodedSecret : maskSecret(decodedSecret || '••••••••••••');
  const locked = is.secure && !passcode;
  const isCard = kind === 'card' || isCardType || isCardValue(decodedSecret);
  const cardValue = isCard ? parseCardValue(decodedSecret) : undefined;
  const footerCardValue = !cardValue
    ? undefined
    : revealed
    ? {
        cvv: cardValue.cvv,
        expire: cardValue.expire,
        number: formatCardNumber(cardValue.number),
      }
    : getMaskedCardValue(cardValue.canonical);
  const isSeed = !isCard && /\s/.test(decodedSecret);
  const createFlowShard = returnToMain && readMode && is.shard;
  const shardLabel = values.length > 1 ? `${L10N.SECRET_TYPE_SHARD} ${currentIndex + 1}` : L10N.SECRET_TYPE_SHARD;
  const lockedQrPreviewColors = useMemo(
    () => ({ background: colors.qrBackground, foreground: colors.qrForeground }),
    [colors.qrBackground, colors.qrForeground],
  );

  useFocusEffect(
    useCallback(() => {
      if (hash) readSecret({ hash });
      // readSecret comes from context and is recreated on rerenders.
      // Depending on it here can retrigger this focus effect in a loop.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash]),
  );

  useEffect(() => {
    if (locked) setShowPasscodeInput(true);
  }, [locked]);

  useEffect(() => {
    setPreviousReadAt(serializeRouteDate(route?.params?.readAt));
  }, [hash, route?.params?.readAt]);

  const handleBack = () => {
    if (returnToMain) {
      navigation.navigate('main', { screen: 'secrets' });
      return;
    }

    navigation.goBack();
  };

  const handleScroll = ({ nativeEvent: { contentOffset: { x } = {} } = {} }) => {
    setCurrentIndex(Math.round(x / width));
  };

  const handleSave = async () => {
    const secret = await createSecret({ name, value: currentValue, website, kind, brand });
    if (!secret) return;

    eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_SAVED_IN_DEVICE, title: L10N.SUCCESS });
    if (values.length > 1 && currentIndex < values.length - 1) {
      scrollViewRef.current?.scrollTo({ animated: true, x: width * (currentIndex + 1) });
      return;
    }

    navigation.goBack();
  };

  const handleDelete = async () => {
    openConfirm(
      navigation,
      {
        caption: L10N.DELETE_SECRET_CAPTION,
        title: L10N.DELETE_SECRET_TITLE,
      },
      {
        onAccept: async () => {
          await deleteSecret({ hash });
          eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_DELETED, title: L10N.SUCCESS });
          navigation.goBack();
        },
      },
    );
  };

  const handleShare = async () => {
    if (locked) return;
    const uri = await qrRef.current?.capture();
    if (!uri) return;
    await Sharing.shareAsync(uri);
  };

  const handleFavorite = async () => {
    const nextFavorite = !favorite;
    await updateSecret({ hash, favorite: nextFavorite });
    setFavorite(nextFavorite);
    eventEmitter.emit(EVENT.NOTIFICATION, {
      text: nextFavorite ? L10N.FAVORITE_ADDED : L10N.FAVORITE_REMOVED,
      title: L10N.SUCCESS,
    });
  };

  const handleGoToScanner = () => {
    navigation.navigate('scanner', { readMode: true, values });
  };

  const handleGoToNFCCard = () => {
    navigation.navigate('scanner', {
      readerType: READER_TYPE.NFC,
      writeMode: { name, value: currentValue },
    });
  };

  const menuOptions = [
    createFlowShard
      ? {
          icon: ICON.DATABASE_ADD,
          onPress: handleSave,
          text: L10N.SAVE_IN_DEVICE,
        }
      : null,
    createFlowShard
      ? {
          icon: ICON.NFC,
          onPress: handleGoToNFCCard,
          text: L10N.SAVE_IN_CARD,
        }
      : null,
    createFlowShard
      ? {
          icon: ICON.SHARE,
          onPress: handleShare,
          text: L10N.SHARE,
        }
      : null,
    hash
      ? {
          accent: favorite,
          icon: favorite ? ICON.FAVORITE : ICON.UNFAVORITE,
          onPress: handleFavorite,
          text: L10N.FAVORITE,
        }
      : null,
    !createFlowShard
      ? {
          icon: ICON.NFC,
          onPress: handleGoToNFCCard,
          text: L10N.SAVE_IN_CARD,
        }
      : null,
    !createFlowShard && !locked
      ? {
          icon: ICON.SHARE,
          onPress: handleShare,
          text: L10N.SHARE,
        }
      : null,
    readMode && is.shard && !createFlowShard
      ? {
          icon: ICON.SCAN,
          onPress: handleGoToScanner,
          text: L10N.SCAN_SHARD,
        }
      : null,
    hash
      ? {
          critical: true,
          icon: ICON.DATABASE_REMOVE,
          onPress: handleDelete,
          text: L10N.DELETE_SECRET,
        }
      : null,
  ].filter(Boolean);

  const handleCopy = async () => {
    if (locked || is.shard) return;
    const valueToCopy = is.shard ? currentValue : decodedSecret;
    if (!valueToCopy) return;

    await Clipboard.setStringAsync(valueToCopy);
    eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_COPIED, title: L10N.SUCCESS });
  };

  const handleToggleReveal = () => {
    if (is.shard) return;

    if (is.secure && !passcode) {
      setShowPasscodeInput(true);
      return;
    }

    setRevealed((current) => !current);
  };

  const handlePasscodeSubmit = () => {
    if (passcodeDraft.length !== 6) return;

    setPasscode(passcodeDraft);
    setShowPasscodeInput(false);
    setPasscodeDraft('');
    setRevealed(false);
  };

  const handlePasscodeCancel = () => {
    setPasscodeDraft('');
    setShowPasscodeInput(false);
    handleBack();
  };

  const header = (
    <View row align="center" style={style.header}>
      <HeaderBackButton onPress={handleBack} />

      <View style={style.headerText}>
        <Text bold size="xl" tone="accent">
          {name}
        </Text>
        {website ? (
          <Text numberOfLines={1} size="l" tone="secondary" style={style.website}>
            {website}
          </Text>
        ) : null}
        {hash ? (
          <Text numberOfLines={1} size="s" tone="secondary" style={style.website}>
            {lastOpenedLabel}
          </Text>
        ) : null}
      </View>

      <Pressable onPress={() => setShowMenu((current) => !current)} style={style.headerAction}>
        <Icon name={ICON.DOTS} size="m" />
      </Pressable>

      {showMenu ? (
        <View style={style.menuWrap}>
          <Menu onClose={() => setShowMenu(false)} options={menuOptions} />
        </View>
      ) : null}
    </View>
  );

  const footer = (
    <View
      style={[
        style.footer,
        theme === 'dark' ? style.footerLight : style.footerDark,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <SecretFooterContent
        cardValue={footerCardValue}
        contrast={theme === 'dark' ? 'light' : 'dark'}
        disableCopy={is.shard}
        disableReveal={is.shard}
        isCard={isCard}
        isSeed={isSeed}
        mode={showPasscodeInput ? 'passcode' : is.shard ? 'shard' : 'value'}
        onCopy={handleCopy}
        onPasscodeCancel={handlePasscodeCancel}
        onPasscodeChange={(nextValue) => setPasscodeDraft(`${nextValue}`.replace(/\D/g, ''))}
        onPasscodeSubmit={handlePasscodeSubmit}
        onShardAction={!createFlowShard ? handleGoToScanner : undefined}
        onToggleReveal={handleToggleReveal}
        passcodePlaceholder={L10N.PASSCODE_PLACEHOLDER}
        passcodeValue={passcodeDraft}
        revealIcon={revealed ? ICON.EYE_OFF : ICON.EYE}
        shardCaption={!createFlowShard ? L10N.SHARD_SCAN_CAPTION : undefined}
        shardLabel={shardLabel}
        showCopy={!createFlowShard}
        showReveal={!createFlowShard}
        value={footerSecret}
      />
    </View>
  );

  return (
    <AppScreen
      contentContainerStyle={style.content}
      footer={footer}
      header={header}
      headerContainerStyle={style.headerContainer}
      headerSafeAreaStyle={style.headerSafeArea}
      scrollable={false}
      style={style.screen}
    >
      {showMenu ? <Pressable onPress={() => setShowMenu(false)} style={style.menuBackdrop} /> : null}

      <View style={style.qrSection}>
        {locked ? (
          <View align="center" style={style.qrSlide}>
            <View style={[style.lockedQrShell, theme === 'dark' && style.lockedQrShellDark]}>
              <QR
                backgroundColor={lockedQrPreviewColors.background}
                containerStyle={[style.lockedQrPreview, theme === 'dark' && style.lockedQrPreviewDark]}
                foregroundColor={lockedQrPreviewColors.foreground}
                pieceBorderRadius={0}
                size={QR_SIZE}
                value={LOCKED_QR_PREVIEW_VALUE}
              />
              <View pointerEvents="none" style={style.lockedQrOverlay}>
                <View style={[style.lockedQrIconWrap, theme === 'dark' && style.lockedQrIconWrapDark]}>
                  <Icon name={ICON.SECURE} size="xl" tone="secondary" />
                </View>
              </View>
            </View>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              onScroll={handleScroll}
              ref={scrollViewRef}
              scrollEnabled={values.length > 1}
              snapTo={width}
              style={style.scrollView}
            >
              {values.map((value, index) => (
                <View align="center" key={`${value}-${index}`} style={[style.qrSlide, { width }]}>
                  <QR
                    ref={index === currentIndex ? qrRef : undefined}
                    containerStyle={style.qrShell}
                    pieceBorderRadius={0}
                    size={QR_SIZE}
                    value={value}
                  />
                </View>
              ))}
            </ScrollView>
            {values.length > 1 ? (
              <View align="center" style={style.pagination}>
                <Pagination currentIndex={currentIndex} length={values.length} />
              </View>
            ) : null}
          </>
        )}
      </View>
    </AppScreen>
  );
};

Viewer.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Viewer };
