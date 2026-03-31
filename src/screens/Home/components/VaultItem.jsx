import { Card, Icon, Pressable, Text, View } from '../../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './VaultItem.style';
import { getVaultLabel, ICON, L10N } from '../../../modules';

const VaultItem = ({ type, secrets = [], onPress }) => {
  const tone = !secrets.length ? 'secondary' : 'primary';

  return (
    <Pressable onPress={secrets.length ? onPress : undefined} style={style.container}>
      <Card spaceBetween style={style.content}>
        <Icon name={ICON[type]} size="xl" tone={tone} />
        <View>
          <Text bold size="s" tone={tone}>
            {getVaultLabel(type)}
          </Text>
          <View row>
            <Text size="xs" tone="secondary">
              {L10N.ITEMS_COUNT({ count: secrets.length })}
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
