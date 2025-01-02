import { Card, Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardAction.style';
import { DEFAULT_THEME } from '../../../App.constants';
import { useStore } from '../../../contexts';

const CardAction = ({ caption, color, icon, text, tiny, onPress }) => {
  const { settings: { theme } = {} } = useStore();

  const common = { color: color === 'accent' && theme !== DEFAULT_THEME ? 'base' : undefined, ellipsizeMode: true };

  return (
    <Pressable onPress={onPress} style={style.container}>
      <Card color={color} spaceBetween style={style.content}>
        <View row>
          <Icon {...common} name={icon} style={style.icon} />
          <Text {...common} bold caption>
            {text}
          </Text>
        </View>

        <View>
          {caption && (
            <Text {...common} caption>
              {caption}
            </Text>
          )}
          {tiny && (
            <Text color="contentLight" {...common} tiny>
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
