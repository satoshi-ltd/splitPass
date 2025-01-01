import { Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './SecretItem.style';

const SecretItem = ({ favorite = false, name, value, vault = 1, createdAt, readAt, onPress }) => {
  const [type] = value;
  const color = favorite ? 'content' : 'contentLight';

  return (
    <Pressable onPress={onPress}>
      <View row style={style.item}>
        <View style={[style.thumbnail, favorite && style.favorite]}>
          <Text bold color={color} tiny>
            {name.substring(0, 1).toUpperCase()}
            {type}
          </Text>
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
