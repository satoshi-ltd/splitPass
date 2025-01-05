import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Icon, Pressable, View } from '@satoshi-ltd/nano-design';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './App.style';
import { Logo } from './components';
import { useStore } from './contexts';
import { getNavigationTheme, ICON } from './modules';
import { Confirm, Create, Home, Onboarding, Scanner, Settings, Vault, Viewer } from './screens';

const Stack = createNativeStackNavigator();

const commonScreenOptions = () => ({
  headerShown: true,
  // headerStyle: {},
  headerTintColor: StyleSheet.value('$colorContent'),
  headerTitle: () => <Logo />,
  headerTitleAlign: 'center',
  // headerTitleStyle: {},
  headerTransparent: true,
});

export const Navigator = () => {
  const { settings: { onboarded, theme } = {} } = useStore();

  const screenOptions = { headerBackTitleVisible: false, headerShadowVisible: false, headerShown: false };
  const screen = {
    ...commonScreenOptions(theme),
    // headerLeft: () => <Text>sss</Text>,
    headerRight: () => {
      const navigation = useNavigation();

      return (
        <View row style={style.header}>
          <Button icon={ICON.ADD} rounded small squared onPress={() => navigation.navigate('create')} />
          <Pressable onPress={() => navigation.navigate('settings')}>
            <Icon name={ICON.SETTINGS} title />
          </Pressable>
        </View>
      );
    },
  };
  const modal = { cardOverlayEnabled: true, gestureEnabled: true, presentation: 'transparentModal' };

  return (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent />

      <Stack.Navigator initialRouteName={onboarded ? 'home' : 'onboarding'} screenOptions={screenOptions}>
        <Stack.Screen name="onboarding" component={Onboarding} options={{ headerShown: false }} />
        <Stack.Screen name="home" component={Home} options={screen} />
        <Stack.Screen name="scanner" component={Scanner} options={{ headerShown: false }} />
        <Stack.Screen name="settings" component={Settings} options={screen} />
        <Stack.Screen name="vault" component={Vault} options={screen} />
        {/* Modal */}
        <Stack.Screen name="confirm" component={Confirm} options={modal} />
        <Stack.Screen name="create" component={Create} options={modal} />
        <Stack.Screen name="viewer" component={Viewer} options={modal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
