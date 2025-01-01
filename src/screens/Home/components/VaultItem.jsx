import { Card, Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './VaultItem.style';
import { ICON } from '../../../modules';

const VaultItem = ({ type, secrets = [], onPress }) => {
  const color = !secrets.length ? 'contentLight' : undefined;

  return (
    <Pressable onPress={secrets.length ? onPress : undefined} style={style.container}>
      <Card spaceBetween style={style.content}>
        <Icon color={color} name={ICON[type]} title />
        <View>
          <Text bold capitalize color={color} caption>
            {type}
          </Text>
          <View row>
            <Text color="contentLight" tiny>
              {`${secrets.length} Items`}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

VaultItem.propTypes = {
  secrets: PropTypes.arrayOf(PropTypes.shape({})),
  type: PropTypes.string,
  onPress: PropTypes.func,
};

export { VaultItem };
