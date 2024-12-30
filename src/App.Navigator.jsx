import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Icon, Text } from '@satoshi-ltd/nano-design';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Logo } from './components';
import { useStore } from './contexts';
import { getNavigationTheme, ICON } from './modules';
import {
  //
  Onboarding,
  Home,
  // Modal
  Create,
  ImportScreen,
  Viewer,
} from './screens';

const Stack = createNativeStackNavigator();

const OPTIONS = {
  MODAL: { cardOverlayEnabled: true, gestureEnabled: true, headerShown: false, presentation: 'modal' },
  SCREEN: { headerShown: false },
  TAB: { headerShown: false },
};

const commonScreenOptions = (theme = 'light') => ({
  headerBackground: () => <BlurView intensity={60} tint={theme} style={{ flex: 1 }} />,
  headerShown: true,
  // headerStyle: {},
  headerTintColor: StyleSheet.value('$colorAccent'),
  headerTitle: () => <Logo />,
  headerTitleAlign: 'center',
  // headerTitleStyle: {},
  headerTransparent: true,
});

export const Navigator = () => {
  const { ready, onboarded, session, settings: { theme = 'light' } = {} } = useStore();

  // const navigation = useNavigation();

  const screenOptions = {
    ...commonScreenOptions(theme),
    headerRight: () =>
      !session?.subscription?.productIdentifier ? (
        <Button
          icon={ICON.STAR}
          secondary
          small
          onPress={() => navigation.navigate('subscription')}
          style={{ marginRight: StyleSheet.value('$viewOffset') }}
        >
          <Text bold tiny>
            $Premium
          </Text>
        </Button>
      ) : (
        <></>
      ),
  };

  return ready ? (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent />

      <Stack.Navigator initialRouteName={onboarded ? 'home' : 'onboarding'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" component={Onboarding} />
        <Stack.Screen name="home" component={Home} options={screenOptions} />

        {/*  */}
        <Stack.Screen
          name="create"
          component={Create}
          options={{ ...OPTIONS.MODAL, presentation: 'transparentModal' }}
        />

        <Stack.Screen
          name="settings"
          component={() => null}
          options={{
            tabBarIcon: ({ color }) => <Icon name="settings" color={color} />,
          }}
        />

        {/* <Stack.Screen name="main" component={Tabs} /> */}

        <Stack.Screen name="import" component={ImportScreen} options={OPTIONS.MODAL} />

        <Stack.Screen
          name="viewer"
          component={Viewer}
          options={{ ...OPTIONS.MODAL, presentation: 'transparentModal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  ) : undefined;
};
