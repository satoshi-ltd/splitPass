import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Icon } from './__primitives__';
import { OPTIONS } from './App.constants';
import { getNavigationTheme } from './helpers';
import { ScanScreen, GenerateScreen, ImportScreen, ExportScreen, OnboardingScreen, VaultScreen } from './screens';
import { defaultTheme } from './themes/default.theme';

StyleSheet.build(defaultTheme);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const Tabs = () => (
  <Tab.Navigator initialRouteName="vault" shifting screenOptions={{ ...OPTIONS.TAB }}>
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
  </Tab.Navigator>
);

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/Poppins-Regular.ttf'),
    'font-medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'font-bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  return ready ? (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style="light" />

      <Stack.Navigator initialRouteName="main" screenOptions={OPTIONS.SCREEN}>
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
  ) : null;
};
