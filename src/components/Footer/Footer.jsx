import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import { Icon, View } from '../../design-system';
import { ICON } from '../../modules';
import { theme } from '../../theme';

const TAB_SIZE = 44;

const routeIcon = (name) => {
  if (name === 'secrets') return ICON.HOME;
  if (name === 'create') return ICON.NEW_SECRET;
  if (name === 'settings') return ICON.SETTINGS;
  return ICON.HOME;
};

const Footer = ({ navigation, onActionPress, state }) => {
  const { colors } = useApp();

  const handleTabPress = (route, isFocused) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const secretsRoute = state.routes[0];
  const createRoute = state.routes[1];
  const settingsRoute = state.routes[2];

  const renderTab = (route) => {
    const routeIndex = state.routes.findIndex(({ key }) => key === route.key);
    const isFocused = state.index === routeIndex;

    return (
      <TouchableOpacity key={route.key} onPress={() => handleTabPress(route, isFocused)} style={styles.tab}>
        <Icon name={routeIcon(route.name)} size="l" tone={isFocused ? 'accent' : 'secondary'} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.root, { backgroundColor: colors.background }]}>
      <View row style={styles.row}>
        {renderTab(secretsRoute)}
        <TouchableOpacity onPress={onActionPress} style={styles.tab}>
          <Icon name={ICON.SCAN} size="l" tone="secondary" />
        </TouchableOpacity>
        {renderTab(createRoute)}
        {renderTab(settingsRoute)}
      </View>
    </SafeAreaView>
  );
};

const styles = {
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    width: '100%',
  },
  tab: {
    alignItems: 'center',
    height: TAB_SIZE,
    justifyContent: 'center',
    width: TAB_SIZE,
  },
};

Footer.propTypes = {
  navigation: PropTypes.object.isRequired,
  onActionPress: PropTypes.func,
  state: PropTypes.object.isRequired,
};

export { Footer };
