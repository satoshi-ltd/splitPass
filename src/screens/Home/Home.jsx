import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { style } from './Home.style';
import { SecretItem } from '../../components';
import { useStore } from '../../contexts';
import { AppScreen, Icon, Input, Menu, Pressable, Text, View } from '../../design-system';
import { EVENT, READER_TYPE, SECRET_TYPE, SECURE_TYPES, SHARD_TYPES } from '../../App.constants';
import {
  eventEmitter,
  getSecretRiskMap,
  getSecretStrength,
  ICON,
  L10N,
  QRParser,
} from '../../modules';
import { theme } from '../../theme';

const getSecretSortTime = ({ createdAt, readAt } = {}) => {
  const timestamp = new Date(readAt || createdAt || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};
const compareSecretsByName = (a = {}, b = {}) =>
  (a.name || '').localeCompare(b.name || '') || (a.username || '').localeCompare(b.username || '');
const serializeRouteDate = (value) =>
  value && typeof value === 'object' && typeof value.toISOString === 'function' ? value.toISOString() : value;
const Home = ({ navigation }) => {
  const { secrets = [], updateSecret } = useStore();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [menuSecret, setMenuSecret] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const sortedSecrets = useMemo(
    () => [...secrets].sort((a, b) => getSecretSortTime(b) - getSecretSortTime(a)),
    [secrets],
  );
  const filteredSecrets = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return sortedSecrets;

    return sortedSecrets.filter(({ name = '', username = '' }) => `${name} ${username}`.toLowerCase().includes(needle));
  }, [search, sortedSecrets]);
  const secretRiskMap = useMemo(() => getSecretRiskMap(secrets), [secrets]);
  const strongCount = filteredSecrets.filter((secret) => getSecretStrength(secret) === 'strong').length;
  const mediocreCount = filteredSecrets.length - strongCount;
  const summaryCountText = filteredSecrets.length === 0 ? L10N.HOME_SUBTITLE_EMPTY : `${filteredSecrets.length}`;
  const summaryText =
    filteredSecrets.length === 0
      ? ''
      : strongCount === filteredSecrets.length
      ? L10N.HOME_SUBTITLE_ALL_STRONG
      : mediocreCount === filteredSecrets.length
      ? L10N.HOME_SUBTITLE_ALL_MEDIOCRE
      : L10N.HOME_SUBTITLE_MIXED({ mediocreCount, strongCount });
  const favoriteSecrets = useMemo(
    () =>
      [...filteredSecrets]
        .filter(({ favorite }) => !!favorite)
        .sort((a, b) => getSecretSortTime(b) - getSecretSortTime(a)),
    [filteredSecrets],
  );

  const sections = useMemo(() => {
    const grouped = filteredSecrets.reduce((result, secret) => {
      const letter = (secret.name || '#').trim().charAt(0).toUpperCase() || '#';
      if (!result[letter]) result[letter] = [];
      result[letter].push(secret);
      return result;
    }, {});

    return Object.fromEntries(
      Object.entries(grouped).map(([letter, items = []]) => [letter, [...items].sort(compareSecretsByName)]),
    );
  }, [filteredSecrets]);
  const orderedSections = useMemo(
    () =>
      Object.entries(sections).sort(([letterA], [letterB]) => {
        if (letterA === '#') return -1;
        if (letterB === '#') return 1;
        return letterA.localeCompare(letterB);
      }),
    [sections],
  );

  const closeMenu = () => {
    setMenuSecret(null);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (secret, anchor) => {
    setMenuSecret(secret);
    setMenuAnchor(anchor || null);
  };

  const decodeSecret = (value = '') => {
    try {
      return QRParser.decode(value) || '';
    } catch {
      return '';
    }
  };

  const canEditDetails = (secret) => {
    const [type] = secret?.value || '';
    if (!type) return false;
    if (SECURE_TYPES.includes(type)) return false;
    if (SHARD_TYPES.includes(type)) return false;
    if (type === SECRET_TYPE.TOTP) return false;
    if (type === SECRET_TYPE.CARD || type === SECRET_TYPE.CARD_SECURE || type === SECRET_TYPE.CARD_SHARD) return false;
    return true;
  };

  const isTotpSecret = (secret) => (secret?.value || '')[0] === SECRET_TYPE.TOTP;

  const handleToggleFavorite = async (secret) => {
    if (!secret?.hash) return;
    const nextFavorite = !secret.favorite;
    await updateSecret({ hash: secret.hash, favorite: nextFavorite });
    eventEmitter.emit(EVENT.NOTIFICATION, {
      text: nextFavorite ? L10N.FAVORITE_ADDED : L10N.FAVORITE_REMOVED,
      title: L10N.SUCCESS,
    });
  };

  const handleEditDetails = (secret) => {
    if (!secret) return;
    const editableSecret = canEditDetails(secret);
    const decoded = editableSecret ? decodeSecret(secret.value) : undefined;
    navigation.navigate('create', {
      edit: {
        editableSecret: !!editableSecret,
        hash: secret.hash,
        name: secret.name,
        notes: secret.notes,
        secret: decoded || undefined,
        username: secret.username,
      },
    });
  };

  const handleSaveToCard = (secret) => {
    if (!secret) return;
    navigation.navigate('scanner', {
      readerType: READER_TYPE.NFC,
      writeMode: {
        name: secret.name,
        notes: secret.notes,
        value: secret.value,
        username: secret.username,
      },
    });
  };

  const menuOptions = useMemo(() => {
    if (!menuSecret) return [];
    const options = [];
    const isTotp = isTotpSecret(menuSecret);
    options.push({
      accent: menuSecret.favorite,
      icon: menuSecret.favorite ? ICON.FAVORITE : ICON.UNFAVORITE,
      onPress: () => {
        closeMenu();
        handleToggleFavorite(menuSecret);
      },
      text: L10N.FAVORITE,
    });
    options.push({
      icon: ICON.NEW_SECRET,
      onPress: () => {
        closeMenu();
        handleEditDetails(menuSecret);
      },
      text: L10N.EDIT_DETAILS,
    });
    if (!isTotp) {
      options.push({
        icon: ICON.NFC,
        onPress: () => {
          closeMenu();
          handleSaveToCard(menuSecret);
        },
        text: L10N.SAVE_IN_CARD,
      });
    }
    return options;
  }, [menuSecret]);

  const menuTop = menuAnchor?.y ? menuAnchor.y + menuAnchor.height + theme.spacing.xs : 0;
  const menuHeight = menuOptions.length * 56 + theme.spacing.sm;
  const menuMaxTop = windowHeight - menuHeight - theme.spacing.lg;
  const menuPositionTop = Math.min(menuTop, menuMaxTop);
  const menuRight = menuAnchor ? Math.max(theme.spacing.md, windowWidth - (menuAnchor.x + menuAnchor.width)) : null;

  const menuOverlay =
    menuSecret && menuAnchor ? (
      <View style={style.menuOverlay} pointerEvents="box-none">
        <Pressable onPress={closeMenu} style={style.menuBackdrop} />
        <View style={[style.menuWrap, { top: menuPositionTop, right: menuRight }]}>
          <Menu onClose={closeMenu} options={menuOptions} />
        </View>
      </View>
    ) : null;

  const header = (
    <View style={style.header}>
      <View style={style.headerText}>
        <Text size="xl">
          <Text semibold size="xl" tone="accent">
            split/
          </Text>
          <Text bold size="xl" tone="accent">
            Pass
          </Text>
        </Text>
        <Text bold size="l" tone="secondary" style={style.headerSubtitle}>
          {L10N.HOME_SUBTITLE_INTRO}{' '}
          <Text bold size="l" tone="primary">
            {summaryCountText}
          </Text>
          {summaryText ? ` ${summaryText}` : ''}
        </Text>
      </View>
      <Input
        actions={
          search ? (
            <Pressable onPress={() => setSearch('')} style={style.searchClearButton}>
              <Icon name={ICON.CLOSE} size="s" tone="secondary" />
            </Pressable>
          ) : null
        }
        containerStyle={style.searchInputShell}
        placeholder={L10N.SEARCH}
        placeholderWhenBlur={L10N.SEARCH}
        style={style.searchInput}
        value={search}
        onChange={setSearch}
      />
    </View>
  );

  return (
    <AppScreen contentContainerStyle={style.content} footer={menuOverlay} header={header}>
      <View>
        {favoriteSecrets.length ? (
          <View style={style.section}>
            <Text size="s" style={style.sectionLabel}>
              {L10N.FAVORITES}
            </Text>
            {favoriteSecrets.map((secret = {}) => (
              <SecretItem
                key={secret.hash}
                {...secret}
                isMediocre={!!secretRiskMap?.[secret.hash]?.isMediocre}
                isRepeated={!!secretRiskMap?.[secret.hash]?.isRepeated}
                onMenu={(anchor) => handleMenuOpen(secret, anchor)}
                onPress={() =>
                  navigation.navigate('secret', {
                    brand: secret.brand,
                    favorite: secret.favorite,
                    hash: secret.hash,
                    kind: secret.kind,
                    name: secret.name,
                    readAt: serializeRouteDate(secret.readAt),
                    readMode: true,
                    username: secret.username,
                    values: [secret.value],
                  })
                }
              />
            ))}
          </View>
        ) : null}

        {orderedSections.map(([letter, items = []]) => (
          <View key={letter} style={style.section}>
            <Text size="s" style={style.sectionLabel}>
              {letter}
            </Text>
            {items.map((secret = {}) => (
              <SecretItem
                key={secret.hash}
                {...secret}
                isMediocre={!!secretRiskMap?.[secret.hash]?.isMediocre}
                isRepeated={!!secretRiskMap?.[secret.hash]?.isRepeated}
                onMenu={(anchor) => handleMenuOpen(secret, anchor)}
                onPress={() =>
                  navigation.navigate('secret', {
                    brand: secret.brand,
                    favorite: secret.favorite,
                    hash: secret.hash,
                    kind: secret.kind,
                    name: secret.name,
                    readAt: serializeRouteDate(secret.readAt),
                    readMode: true,
                    username: secret.username,
                    values: [secret.value],
                  })
                }
              />
            ))}
          </View>
        ))}
      </View>
    </AppScreen>
  );
};

Home.propTypes = {
  navigation: PropTypes.any,
};

export { Home };
