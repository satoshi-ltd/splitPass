import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { style } from './Home.style';
import { SecretItem } from '../../components';
import { useStore } from '../../contexts';
import { AppScreen, Icon, Input, Pressable, Text, View } from '../../design-system';
import { getSecretRiskMap, getSecretStrength, ICON, L10N } from '../../modules';

const getSecretSortTime = ({ createdAt, readAt } = {}) => {
  const timestamp = new Date(readAt || createdAt || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};
const compareSecretsByName = (a = {}, b = {}) =>
  (a.name || '').localeCompare(b.name || '') || (a.username || '').localeCompare(b.username || '');
const serializeRouteDate = (value) =>
  value && typeof value === 'object' && typeof value.toISOString === 'function' ? value.toISOString() : value;

const Home = ({ navigation }) => {
  const { secrets = [] } = useStore();
  const [search, setSearch] = useState('');
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
    <AppScreen contentContainerStyle={style.content} header={header}>
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
