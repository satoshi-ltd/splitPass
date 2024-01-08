import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Icon } from './__primitives__';
import { SCREEN_OPTIONS, TAB_OPTIONS, MODAL_OPTIONS } from './App.constants';
import { getNavigationTheme } from './helpers';
import {
  LoginScreen,
  ScanScreen,
  GenerateScreen,
  ImportScreen,
  VaultScreen,
  SettingsScreen,
  ModalGenerate,
} from './screens';
import { defaultTheme } from './themes/default.theme';

StyleSheet.build(defaultTheme);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const Tabs = () => (
  <Tab.Navigator initialRouteName="scan" shifting screenOptions={{ ...TAB_OPTIONS }}>
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
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="settings" color={color} />,
      }}
    />
  </Tab.Navigator>
);

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/Roobert-400.ttf'),
    // 'font-bold': require('../assets/fonts/Roobert-700.ttf'),
    // 'font-default': require('../assets/fonts/Rebond-Grotesque-600.ttf'),
    'font-bold': require('../assets/fonts/Rebond-Grotesque-700.ttf'),
  });

  return ready ? (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style="light" />

      <Stack.Navigator initialRouteName="auth" screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="auth" component={LoginScreen} />
        <Stack.Screen name="main" component={Tabs} />

        {/* -- modals */}
        <Stack.Screen name="modal" component={ModalGenerate} options={MODAL_OPTIONS} />
        <Stack.Screen name="import" component={ImportScreen} options={{ ...MODAL_OPTIONS, headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  ) : null;
};
