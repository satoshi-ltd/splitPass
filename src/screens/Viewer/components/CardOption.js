import { Card, Icon, Pressable, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardOption.style';

const CardOption = ({ color, icon, text, ...others }) => (
  <Pressable {...others} style={style.container}>
    <Card color={color} outlined={!color} small style={style.content}>
      <Icon name={icon} title />
      <Text bold tiny>
        {text}
      </Text>
    </Card>
  </Pressable>
);

CardOption.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  text: PropTypes.string,
};

export { CardOption };
