import { Button, Icon, Pressable, View } from '@satoshi-ltd/nano-design';
import { BlurView } from 'expo-blur';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Header.style';
import { useStore } from '../../contexts';
import { ICON } from '../../modules';
import { Logo } from '../Logo';

const Header = ({ showSettings = false, navigation, onBack }) => {
  const { settings: { theme = 'light' } = {} } = useStore();

  return (
    <BlurView intensity={100} tint={theme} style={style.container}>
      <View row style={style.options}>
        {onBack && (
          <Pressable onPress={onBack}>
            <Icon name={ICON.BACK} title />
          </Pressable>
        )}
        <Logo />
      </View>

      <View row style={style.options}>
        {/* <Pressable>
          <Icon name={ICON.SEARCH} title />
        </Pressable> */}

        <Button icon={ICON.ADD} rounded small squared onPress={() => navigation.navigate('create')} />

        {showSettings && (
          <Pressable onPress={() => navigation.navigate('settings')}>
            <Icon name={ICON.SETTINGS} title />
          </Pressable>
        )}
      </View>
    </BlurView>
  );
};

Header.propTypes = {
  showSettings: PropTypes.bool,
  navigation: PropTypes.any,
  onBack: PropTypes.func,
};

export { Header };
