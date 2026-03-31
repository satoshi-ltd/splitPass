import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import { Footer } from '../../components';
import { useStore } from '../../contexts';
import { Create } from '../Create';
import { Home } from '../Home';
import { Settings } from '../Settings';

const Tab = createBottomTabNavigator();

const Main = ({ navigation, route }) => {
  const { secrets = [] } = useStore();
  const redirectedToFirstSecret = useRef(false);
  const fromOnboarding = !!route?.params?.onboarding;

  useEffect(() => {
    if (!fromOnboarding || redirectedToFirstSecret.current || secrets.length) return;

    redirectedToFirstSecret.current = true;
    navigation.navigate('create', { onboarding: true });
  }, [fromOnboarding, navigation, secrets.length]);

  return (
    <Tab.Navigator
      initialRouteName="secrets"
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <Footer {...props} onActionPress={() => navigation.navigate('scanner')} />}
    >
      <Tab.Screen name="secrets" component={Home} />
      <Tab.Screen
        name="create"
        component={Create}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen name="settings" component={Settings} />
    </Tab.Navigator>
  );
};

Main.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Main };
