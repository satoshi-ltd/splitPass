import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Image } from 'react-native';

import { style } from './SecretItem.style';
import { SECRET_TYPE, SHARD_TYPES } from '../../App.constants';
import { useStore } from '../../contexts';
import { Icon, Pressable, Text, View } from '../../design-system';
import { extractWebsiteDomain, ICON, L10N, QRParser, resolveSecretIcon } from '../../modules';
import { FaviconService } from '../../services';

const SHARD_SHARES = 3;

const resolveShardSegments = (type, value = '') => {
  const [, ...rawDigits] = `${value}`;
  const digits = rawDigits.join('');

  switch (type) {
    case SECRET_TYPE.PASSWORD_SHARD:
      return digits.match(/.{1,2}/g) || [];
    case SECRET_TYPE.SEED_PHRASE_SHARD:
      return digits.match(/.{1,4}/g) || [];
    case SECRET_TYPE.CARD_SHARD: {
      const decoded = QRParser.decode(value);
      return decoded ? decoded.split('|') : [];
    }
    default:
      return [];
  }
};

const isMaskedShardSegment = (type, segment = '') => {
  if (type === SECRET_TYPE.CARD_SHARD) return /^_+$/.test(segment);
  if (type === SECRET_TYPE.SEED_PHRASE_SHARD) return segment === '0000';
  return segment === '00';
};

const resolveShardIndex = (type, value = '') => {
  const segments = resolveShardSegments(type, value);
  const maskedIndexes = segments.reduce((result, segment, index) => {
    if (isMaskedShardSegment(type, segment)) result.push(index);
    return result;
  }, []);
  if (!maskedIndexes.length) return undefined;

  const firstMaskedIndex = maskedIndexes[0];
  const expectedRemainder = firstMaskedIndex % SHARD_SHARES;
  const validPattern = maskedIndexes.every((index) => index % SHARD_SHARES === expectedRemainder);
  if (!validPattern) return undefined;

  return ((SHARD_SHARES - expectedRemainder) % SHARD_SHARES) + 1;
};

const resolveSecretSubtitle = ({ type, username }) => {
  if (username) return username;

  switch (type) {
    case SECRET_TYPE.PASSWORD:
    case SECRET_TYPE.PASSWORD_SECURE:
      return L10N.SECRET_TYPE_PASSWORD;
    case SECRET_TYPE.PASSWORD_SHARD:
      return L10N.SECRET_TYPE_SHARD;
    case SECRET_TYPE.CARD:
    case SECRET_TYPE.CARD_SECURE:
      return L10N.SECRET_TYPE_CARD;
    case SECRET_TYPE.CARD_SHARD:
      return L10N.SECRET_TYPE_SHARD;
    case SECRET_TYPE.TOTP:
      return L10N.SECRET_TYPE_TOTP;
    case SECRET_TYPE.SEED_PHRASE:
    case SECRET_TYPE.SEED_PHRASE_SECURE:
      return L10N.SECRET_TYPE_SEED_PHRASE;
    case SECRET_TYPE.SEED_PHRASE_SHARD:
      return L10N.SECRET_TYPE_SHARD;
    default:
      return undefined;
  }
};

const resolveIconFallback = (type) => {
  switch (type) {
    case SECRET_TYPE.CARD:
    case SECRET_TYPE.CARD_SECURE:
    case SECRET_TYPE.CARD_SHARD:
      return 'credit-card-outline';
    case SECRET_TYPE.SEED_PHRASE:
    case SECRET_TYPE.SEED_PHRASE_SECURE:
    case SECRET_TYPE.SEED_PHRASE_SHARD:
      return 'wallet-outline';
    case SECRET_TYPE.TOTP:
      return 'shield-key-outline';
    case SECRET_TYPE.PASSWORD_SECURE:
      return ICON.SECURE;
    default:
      return ICON.QRCODE;
  }
};

const SecretItem = ({ brand, favorite = false, kind, name, username, value = '', website, onPress }) => {
  const { settings } = useStore();
  const [type] = value;
  const [faviconFailed, setFaviconFailed] = useState(false);
  const [faviconUri, setFaviconUri] = useState('');
  const shardIndex = SHARD_TYPES.includes(type) ? resolveShardIndex(type, value) : undefined;
  const iconName = resolveSecretIcon({ brand, kind, name, type: resolveIconFallback(type) });
  const subtitle = resolveSecretSubtitle({ type, username });
  const faviconDomain = useMemo(() => extractWebsiteDomain(website, name), [name, website]);
  const websiteFaviconsEnabled = settings?.websiteFaviconsEnabled !== false;

  useEffect(() => {
    setFaviconFailed(false);
    setFaviconUri('');
  }, [faviconDomain, websiteFaviconsEnabled]);

  useEffect(() => {
    let cancelled = false;

    if (!websiteFaviconsEnabled || !faviconDomain) return undefined;

    const loadFavicon = async () => {
      const nextUri = await FaviconService.resolve(faviconDomain);
      if (!cancelled) setFaviconUri(nextUri || '');
    };

    loadFavicon();

    return () => {
      cancelled = true;
    };
  }, [faviconDomain, websiteFaviconsEnabled]);

  return (
    <Pressable onPress={onPress}>
      <View row style={style.item}>
        <View style={[style.thumbnail, favorite && style.favorite]}>
          {websiteFaviconsEnabled && faviconUri && !faviconFailed ? (
            <Image
              source={{ uri: faviconUri }}
              style={style.thumbnailImage}
              onError={() => {
                if (faviconDomain) FaviconService.invalidate(faviconDomain);
                setFaviconFailed(true);
              }}
            />
          ) : (
            <Icon tone={favorite ? 'onAccent' : 'primary'} name={iconName} />
          )}
          {shardIndex ? (
            <Text
              bold
              size="xs"
              tone={favorite ? 'onAccent' : 'secondary'}
              style={[style.shardBadgeText, favorite && style.shardBadgeTextFavorite]}
            >
              /{shardIndex}
            </Text>
          ) : null}
        </View>

        <View flex style={style.body}>
          <Text semibold ellipsizeMode="tail" numberOfLines={1} style={style.name}>
            {name}
          </Text>
          {subtitle ? (
            <Text ellipsizeMode="tail" numberOfLines={1} size="xs" tone="secondary" style={style.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={style.action}>
          <Icon name={ICON.DOTS} size="s" tone="secondary" />
        </View>
      </View>
    </Pressable>
  );
};

SecretItem.propTypes = {
  brand: PropTypes.string,
  favorite: PropTypes.bool,
  kind: PropTypes.string,
  name: PropTypes.string,
  username: PropTypes.string,
  value: PropTypes.string,
  website: PropTypes.string,
  onPress: PropTypes.func,
};

export { SecretItem };
