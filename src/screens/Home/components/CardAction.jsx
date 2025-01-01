import { Card, Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardAction.style';

const CardAction = ({ caption, color, icon, text, tiny, onPress }) => {
  return (
    <Pressable onPress={onPress} style={style.container}>
      <Card color={color} spaceBetween style={style.content}>
        <View row>
          <Icon name={icon} style={style.icon} />
          <Text bold caption>
            {text}
          </Text>
        </View>

        <View>
          {caption && <Text caption>{caption}</Text>}
          {tiny && (
            <Text color="contentLight" tiny>
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
