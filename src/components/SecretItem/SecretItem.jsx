import PropTypes from 'prop-types';
import React from 'react';

import { style } from './SecretItem.style';
import { SECRET_TYPE, SECURE_TYPES, SHARD_TYPES } from '../../App.constants';
import { Icon, Pressable, Text, View } from '../../design-system';
import { ICON, L10N, resolveSecretIcon } from '../../modules';

const resolveSecretSubtitle = ({ type, website }) => {
  if (website) return website;

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
    case SECRET_TYPE.SEED_PHRASE:
    case SECRET_TYPE.SEED_PHRASE_SECURE:
      return L10N.SECRET_TYPE_SEED_PHRASE;
    case SECRET_TYPE.SEED_PHRASE_SHARD:
      return L10N.SECRET_TYPE_SHARD;
    default:
      return undefined;
  }
};

const SecretItem = ({ brand, favorite = false, kind, name, value = '', website, onPress }) => {
  const [type] = value;
  const iconName = SHARD_TYPES.includes(type)
    ? ICON.SHARD
    : resolveSecretIcon({ brand, kind, name, type: SECURE_TYPES.includes(type) ? ICON.SECURE : ICON.QRCODE, website });
  const subtitle = resolveSecretSubtitle({ type, website });

  return (
    <Pressable onPress={onPress}>
      <View row style={style.item}>
        <View style={[style.thumbnail, favorite && style.favorite]}>
          <Icon tone={favorite ? 'onAccent' : 'primary'} name={iconName} />
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
  value: PropTypes.string,
  website: PropTypes.string,
  onPress: PropTypes.func,
};

export { SecretItem };
