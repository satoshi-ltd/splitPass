import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { Icon } from './components';
import { useStore } from './contexts';
import { getNavigationTheme } from './modules';
import { ScanScreen, GenerateScreen, ImportScreen, ExportScreen, OnboardingScreen, VaultScreen } from './screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const OPTIONS = {
  MODAL: { cardOverlayEnabled: true, gestureEnabled: true, headerShown: false, presentation: 'modal' },
  SCREEN: { headerShown: false },
  TAB: { headerShown: false },
};

export const Tabs = () => (
  <Tab.Navigator initialRouteName="generate" shifting screenOptions={{ ...OPTIONS.TAB }}>
    <Tab.Screen
      name="scan"
      component={ScanScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="scan" color={color} />,
        tabBarLabel: 'Scan',
        title: 'Title Scan',
      }}
    />
    <Tab.Screen
      name="generate"
      component={GenerateScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="qr" color={color} />,
      }}
    />
    <Tab.Screen
      name="vault"
      component={VaultScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="vault" color={color} />,
      }}
    />
    <Tab.Screen
      name="settings"
      component={() => null}
      options={{
        tabBarIcon: ({ color }) => <Icon name="settings" color={color} />,
      }}
    />
  </Tab.Navigator>
);

export const Navigator = () => {
  const { ready, onboarded } = useStore();

  return ready ? (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style="dark" />

      <Stack.Navigator initialRouteName={onboarded ? 'main' : 'onboarding'} screenOptions={OPTIONS.SCREEN}>
        <Stack.Screen name="onboarding" component={OnboardingScreen} />
        <Stack.Screen name="main" component={Tabs} />

        <Stack.Screen name="import" component={ImportScreen} options={OPTIONS.MODAL} />
        <Stack.Screen
          name="export"
          component={ExportScreen}
          options={{ ...OPTIONS.MODAL, presentation: 'transparentModal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  ) : undefined;
};
