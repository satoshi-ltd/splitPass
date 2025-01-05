import { Card, Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Setting.style';
import { DEFAULT_THEME } from '../../../App.constants';
import { Tabs } from '../../../components';
import { useStore } from '../../../contexts';
import { ICON } from '../../../modules';

const Setting = ({
  activity = false,
  caption,
  disabled,
  icon,
  options,
  selected,
  text,
  onChange,
  onPress = () => {},
} = {}) => {
  const { settings: { theme } = {} } = useStore();

  return (
    <Pressable onPress={!disabled && !activity ? onPress : undefined}>
      <View gap row style={style.setting}>
        {icon && (
          <Card color={disabled ? 'border' : 'accent'} small style={{ width: 'auto' }}>
            <Icon color={theme !== DEFAULT_THEME ? 'base' : undefined} name={icon} />
          </Card>
        )}
        <View row style={style.content}>
          <View flex>
            <Text color={disabled ? 'contentLight' : undefined}>{text}</Text>
            {caption && (
              <Text caption color="contentLight">
                {caption}
              </Text>
            )}
          </View>

          {activity ? (
            <ActivityIndicator size="small" color={StyleSheet.value('$colorContent')} />
          ) : options ? (
            <Tabs {...{ selected, options, onChange }} />
          ) : (
            <Icon name={ICON.RIGHT} />
          )}
        </View>
      </View>
    </Pressable>
  );
};

Setting.displayName = 'Setting';

Setting.propTypes = {
  activity: PropTypes.bool,
  caption: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape()),
  selected: PropTypes.number,
  text: PropTypes.string,
  onChange: PropTypes.func,
  onPress: PropTypes.func,
};

export { Setting };
