import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Logo } from './components';
import { useStore } from './contexts';
import { getNavigationTheme, ICON } from './modules';
import { Onboarding, Home, Create, Scanner, Vault, Viewer } from './screens';

const Stack = createNativeStackNavigator();

const commonScreenOptions = (theme = 'light') => ({
  headerBackground: () => <BlurView intensity={10} tint={theme} style={{ flex: 1 }} />,
  headerShown: true,
  // headerStyle: {},
  headerTintColor: StyleSheet.value('$colorAccent'),
  headerTitle: () => <Logo />,
  headerTitleAlign: 'center',
  // headerTitleStyle: {},
  headerTransparent: true,
});

export const Navigator = () => {
  const { settings: { onboarded, subscription, theme = 'light' } = {} } = useStore();

  const screenOptions = { headerBackTitleVisible: false, headerShadowVisible: false, headerShown: false };
  const screen = {
    ...commonScreenOptions(theme),
    // headerLeft: () => <Text>sss</Text>,
    headerRight: () => (
      <View
        row
        style={{
          gap: StyleSheet.value('$viewOffset'),

          marginRight: StyleSheet.value('$viewOffset'),
        }}
      >
        {subscription?.productIdentifier ? (
          <Button icon={ICON.STAR} secondary small onPress={() => navigation.navigate('subscription')}>
            <Text bold tiny>
              $Premium
            </Text>
          </Button>
        ) : (
          <></>
        )}

        <View gap row>
          <Pressable>
            <Icon _color="contentLight" name={ICON.SEARCH} title />
          </Pressable>

          <Pressable>
            <Icon _color="contentLight" name={ICON.SETTINGS} title />
          </Pressable>
        </View>
      </View>
    ),
  };
  const modal = { cardOverlayEnabled: true, gestureEnabled: true, presentation: 'transparentModal' };

  return (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent />

      <Stack.Navigator initialRouteName={onboarded ? 'home' : 'onboarding'} screenOptions={screenOptions}>
        <Stack.Screen name="onboarding" component={Onboarding} options={{ headerShown: false }} />
        <Stack.Screen name="home" component={Home} _options={screen} />
        <Stack.Screen name="vault" component={Vault} _options={screen} />

        {/* <Stack.Screen name="settings" component={() => null} /> */}
        {/* Modal */}
        <Stack.Screen name="create" component={Create} options={modal} />
        <Stack.Screen name="scanner" component={Scanner} options={modal} />
        <Stack.Screen name="viewer" component={Viewer} options={modal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
