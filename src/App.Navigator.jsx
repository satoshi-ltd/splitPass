import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './App.style';
import { Logo, Menu } from './components';
import { useStore } from './contexts';
import { Confirm, HeaderBackButton, Modal } from './design-system';
import { consumeConfirmCallbacks, getNavigationTheme, L10N, navigationRef } from './modules';
import { Language, Main, Marketplace, Onboarding, Passwords, Scanner, Unlock, Vault, Viewer } from './screens';

const Stack = createNativeStackNavigator();

const ConfirmScreen = ({ route: { params: { callbackId, ...params } = {} } = {}, navigation: { goBack } = {} }) => {
  const handleCancel = () => {
    const { onCancel } = consumeConfirmCallbacks(callbackId);
    goBack();
    onCancel?.();
  };

  const handleAccept = () => {
    const { onAccept } = consumeConfirmCallbacks(callbackId);
    goBack();
    onAccept?.();
  };

  return (
    <Modal onClose={handleCancel}>
      <Confirm accept={L10N.ACCEPT} cancel={L10N.CANCEL} {...params} onCancel={handleCancel} onAccept={handleAccept} />
    </Modal>
  );
};

ConfirmScreen.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

const commonScreenOptions = () => ({
  headerBackVisible: false,
  headerShown: true,
  headerTitle: () => <Logo />,
  headerTitleAlign: 'center',
  headerTransparent: false,
});

export const Navigator = () => {
  const { security: { configured, unlocked } = {}, settings: { onboarded, theme } = {} } = useStore();
  const [routeName, setRouteName] = useState('');

  const screenOptions = {
    headerBackTitleVisible: false,
    headerShadowVisible: false,
    headerShown: false,
  };
  const screen = {
    ...commonScreenOptions(),
    headerLeft: ({ canGoBack = false }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigation = useNavigation();

      return canGoBack ? (
        <HeaderBackButton
          onPress={navigation.goBack}
          style={style.buttonBack}
          tone={routeName === 'scanner' ? 'onAccent' : 'primary'}
        />
      ) : null;
    },
  };
  const modal = {
    cardOverlayEnabled: true,
    gestureEnabled: true,
    presentation: 'transparentModal',
  };

  const initialRouteName = !configured ? 'onboarding' : !unlocked ? 'unlock' : onboarded ? 'main' : 'onboarding';
  const navigationKey = `${configured ? 'configured' : 'fresh'}:${unlocked ? 'open' : 'locked'}:${
    onboarded ? 'ready' : 'new'
  }`;

  useEffect(() => {
    setRouteName(initialRouteName);
  }, [initialRouteName, navigationKey]);

  useEffect(() => {
    if (!configured || unlocked || !navigationRef.isReady()) return;

    if (navigationRef.getCurrentRoute()?.name !== 'unlock') {
      navigationRef.resetRoot({ index: 0, routes: [{ name: 'unlock' }] });
    }
    setRouteName('unlock');
  }, [configured, unlocked]);

  return (
    <NavigationContainer
      key={navigationKey}
      ref={navigationRef}
      onStateChange={(state) => setRouteName(state.routes[state.index].name)}
      theme={getNavigationTheme(theme)}
    >
      <StatusBar style={routeName === 'scanner' ? 'light' : 'dark'} translucent />

      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions}>
        <Stack.Screen name="onboarding" component={Onboarding} options={{ headerShown: false }} />
        <Stack.Screen name="passphrase" component={Unlock} options={{ headerShown: false }} />
        <Stack.Screen name="unlock" component={Unlock} options={{ headerShown: false }} />
        <Stack.Screen name="main" component={Main} options={{ headerShown: false }} />
        <Stack.Screen
          name="scanner"
          component={Scanner}
          options={{
            ...screen,
            headerTitleAlign: 'left',
            headerStyle: { backgroundColor: '#000000' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="passwordGenerator"
          component={Passwords}
          options={{
            ...screenOptions,
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="language" component={Language} options={{ headerShown: false }} />
        <Stack.Screen name="marketplace" component={Marketplace} options={{ ...screen, headerRight: undefined }} />
        <Stack.Screen name="vault" component={Vault} options={screen} />
        <Stack.Screen name="secret" component={Viewer} options={{ headerShown: false }} />
        <Stack.Screen name="confirm" component={ConfirmScreen} options={modal} />
        <Stack.Screen name="menu" component={Menu} options={modal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
