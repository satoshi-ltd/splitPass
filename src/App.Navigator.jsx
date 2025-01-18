import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Icon, Pressable, View } from '@satoshi-ltd/nano-design';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './App.style';
import { Confirm, Logo, Menu } from './components';
import { useStore } from './contexts';
import { getNavigationTheme, ICON } from './modules';
import { Create, Home, Onboarding, Scanner, Settings, SplitCard, Subscription, Vault, Viewer } from './screens';

const Stack = createNativeStackNavigator();

const commonScreenOptions = (theme = 'light') => ({
  headerBackground: () => <BlurView intensity={60} tint={theme} style={{ flex: 1 }} />,
  headerShown: true,
  headerTintColor: StyleSheet.value('$colorContent'),
  headerTitle: () => <Logo forceTheme={theme} />,
  headerTitleAlign: 'center',
  headerTransparent: true,
});

export const Navigator = () => {
  const { settings: { onboarded, theme } = {} } = useStore();
  const [routeName, setRouteName] = useState('');

  const screenOptions = {
    headerBackTitleVisible: false,
    headerShadowVisible: false,
    headerShown: false,
  };
  const screen = {
    ...commonScreenOptions(theme),
    headerLeft: ({ canGoBack = false }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigation = useNavigation();

      return canGoBack ? (
        <Button
          secondary={routeName === 'scanner'}
          icon={ICON.BACK}
          small
          onPress={navigation.goBack}
          style={style.buttonBack}
        />
      ) : null;
    },
    headerRight: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigation = useNavigation();

      return (
        <View row style={style.headerRight}>
          <Button icon={ICON.ADD} rounded small squared onPress={() => navigation.navigate('create')} />
          <Pressable onPress={() => navigation.navigate('settings')}>
            <Icon name={ICON.SETTINGS} title />
          </Pressable>
        </View>
      );
    },
  };
  const modal = {
    cardOverlayEnabled: true,
    gestureEnabled: true,
    presentation: 'transparentModal',
  };

  return (
    <NavigationContainer
      onStateChange={(state) => setRouteName(state.routes[state.index].name)}
      theme={getNavigationTheme(routeName)}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent />

      <Stack.Navigator initialRouteName={onboarded ? 'home' : 'onboarding'} screenOptions={screenOptions}>
        <Stack.Screen name="onboarding" component={Onboarding} options={{ headerShown: false }} />
        <Stack.Screen name="home" component={Home} options={screen} />
        <Stack.Screen
          name="scanner"
          component={Scanner}
          options={{
            ...screen,
            headerRight: undefined,
            ...(theme === 'light' ? commonScreenOptions('dark') : undefined),
          }}
        />
        <Stack.Screen name="settings" component={Settings} options={{ ...screen, headerRight: undefined }} />
        <Stack.Screen name="splitcard" component={SplitCard} options={{ ...screen, headerRight: undefined }} />
        <Stack.Screen name="vault" component={Vault} options={screen} />
        {/* Modal */}
        <Stack.Screen name="create" component={Create} options={modal} />
        <Stack.Screen name="subscription" component={Subscription} options={modal} />
        <Stack.Screen name="viewer" component={Viewer} options={modal} />
        {/* Wrapper */}
        <Stack.Screen name="confirm" component={Confirm} options={modal} />
        <Stack.Screen name="menu" component={Menu} options={modal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
