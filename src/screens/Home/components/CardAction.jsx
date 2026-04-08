import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardAction.style';
import { DEFAULT_THEME } from '../../../App.constants';
import { useStore } from '../../../contexts';
import { Card, Icon, Pressable, Text, View } from '../../../design-system';

const CardAction = ({ caption, color, icon, text, tiny, onPress }) => {
  const { settings: { theme } = {} } = useStore();

  const commonTone = color === 'accent' && theme !== DEFAULT_THEME ? 'onAccent' : 'primary';

  return (
    <Pressable onPress={onPress} style={style.container}>
      <Card color={color} spaceBetween style={style.content}>
        <View row>
          <Icon name={icon} style={style.icon} tone={commonTone} />
          <Text bold ellipsizeMode="tail" numberOfLines={1} size="s" tone={commonTone}>
            {text}
          </Text>
        </View>

        <View>
          {caption && (
            <Text size="s" tone={commonTone}>
              {caption}
            </Text>
          )}
          {tiny && (
            <Text size="xs" tone="secondary">
              {tiny}
            </Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
};

CardAction.propTypes = {
  caption: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  text: PropTypes.string,
  tiny: PropTypes.string,
  onPress: PropTypes.func,
};

export { CardAction };
