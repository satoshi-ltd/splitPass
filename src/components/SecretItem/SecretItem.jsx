import { Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './SecretItem.style';
import { DEFAULT_THEME, SECURE_TYPES, SHARD_TYPES } from '../../App.constants';
import { useStore } from '../../contexts';
import { ICON } from '../../modules';

const SecretItem = ({ favorite = false, name, value, vault = 1, createdAt, onPress }) => {
  const { settings: { theme } = {} } = useStore();

  const [type] = value;

  return (
    <Pressable onPress={onPress}>
      <View row style={style.item}>
        <View style={[style.thumbnail, favorite && style.favorite]}>
          <Icon
            color={theme === DEFAULT_THEME || !favorite ? 'content' : 'base'}
            name={SECURE_TYPES.includes(type) ? ICON.SECURE : SHARD_TYPES.includes(type) ? ICON.SHARD : ICON.QRCODE}
          />
        </View>

        <View flex>
          <View gap row spaceBetween>
            <Text bold ellipsizeMode style={style.name}>
              {name}
            </Text>
            <Text color="content" tiny>
              {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(createdAt)}
            </Text>
          </View>

          <View row spaceBetween>
            <Text color="contentLight" tiny>
              {vault}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

SecretItem.propTypes = {
  favorite: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.string,
  vault: PropTypes.string,
  createdAt: PropTypes.any,
  readAt: PropTypes.any,
  onPress: PropTypes.func,
};

export { SecretItem };
