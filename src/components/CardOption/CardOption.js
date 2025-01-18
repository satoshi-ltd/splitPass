import { Card, Icon, Pressable, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardOption.style';
import { DEFAULT_THEME } from '../../App.constants';
import { useStore } from '../../contexts';

const CardOption = ({ color, icon, squared = false, text, ...others }) => {
  const { settings: { theme } = {} } = useStore();

  const common = { color: color === 'accent' && theme !== DEFAULT_THEME ? 'base' : undefined };

  return (
    <Pressable {...others} style={[style.container, squared && style.squared]}>
      <Card align={!text ? 'center' : undefined} color={color} outlined={!color} small style={[style.content]}>
        <Icon {...common} name={icon} title />
        {text && (
          <Text {...common} bold tiny>
            {text}
          </Text>
        )}
      </Card>
    </Pressable>
  );
};

CardOption.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  squared: PropTypes.bool,
  text: PropTypes.string,
};

export { CardOption };
