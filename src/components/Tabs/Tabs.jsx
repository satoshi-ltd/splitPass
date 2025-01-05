import { Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './Tabs.style';

const Tabs = ({ accent = false, disabled = false, options = [], selected: propSelected, onChange, ...others }) => {
  const [selected, setSelected] = useState(propSelected);

  useEffect(() => {
    setSelected(propSelected);
  }, [propSelected]);

  const handlePress = (index) => {
    setSelected(index);
    onChange(options[index]);
  };

  return (
    <View {...others} row style={[style.tabs, others.style]}>
      {options.map(({ icon, text }, index) => {
        const color = selected === index ? (accent ? 'content' : 'base') : 'contentLight';
        return (
          <Pressable
            disabled={disabled}
            key={`tab:${text || icon}`}
            onPress={() => handlePress(index)}
            style={[style.tab, selected === index && style.active, selected === index && accent && style.accent]}
          >
            {icon && <Icon color={color} name={icon} />}

            {text && (
              <Text bold caption color={color}>
                {text}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

Tabs.propTypes = {
  accent: PropTypes.bool,
  disabled: PropTypes.bool,
  selected: PropTypes.number,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  onChange: PropTypes.func,
};

export { Tabs };
