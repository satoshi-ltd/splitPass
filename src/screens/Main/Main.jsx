import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PropTypes from 'prop-types';
import React from 'react';

import { Footer } from '../../components';
import { useStore } from '../../contexts';
import { Create } from '../Create';
import { Home } from '../Home';
import { Settings } from '../Settings';

const Tab = createBottomTabNavigator();

const Main = ({ navigation, route }) => {
  const { secrets = [] } = useStore();
  const fromOnboarding = !!route?.params?.onboarding;
  const shouldOpenCreateFirst = fromOnboarding && !secrets.length;

  return (
    <Tab.Navigator
      initialRouteName={shouldOpenCreateFirst ? 'create' : 'secrets'}
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <Footer {...props} onActionPress={() => navigation.navigate('scanner')} />}
    >
      <Tab.Screen name="secrets" component={Home} />
      <Tab.Screen
        name="create"
        component={Create}
        initialParams={shouldOpenCreateFirst ? { onboarding: true } : undefined}
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
