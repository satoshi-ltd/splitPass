import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Icon, Pressable, View } from '@satoshi-ltd/nano-design';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Logo } from './components';
import { useStore } from './contexts';
import { getNavigationTheme, ICON } from './modules';
import { Create, Home, Onboarding, Scanner, Settings, Vault, Viewer } from './screens';

const Stack = createNativeStackNavigator();

const commonScreenOptions = (theme = 'light') => ({
  headerBackground: () => <BlurView intensity={80} tint={theme} style={{ flex: 1 }} />,
  headerShown: true,
  // headerStyle: {},
  headerTintColor: StyleSheet.value('$colorContent'),
  headerTitle: () => <Logo />,
  headerTitleAlign: 'center',
  // headerTitleStyle: {},
  headerTransparent: true,
});

export const Navigator = () => {
  const { settings: { onboarded, theme = 'light' } = {} } = useStore();

  const screenOptions = { headerBackTitleVisible: false, headerShadowVisible: false, headerShown: false };
  const screen = {
    ...commonScreenOptions(theme),
    // headerLeft: () => <Text>sss</Text>,
    headerRight: () => {
      const navigation = useNavigation();

      return (
        <View
          row
          style={{
            gap: StyleSheet.value('$viewOffset') / 2,
            // marginRight: StyleSheet.value('$viewOffset'),
          }}
        >
          <Button icon={ICON.ADD} rounded small squared onPress={() => navigation.navigate('create')} />
          <Pressable>
            <Icon _color="contentLight" name={ICON.SETTINGS} title onPress={() => navigation.navigate('settings')} />
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
        <Stack.Screen name="settings" component={Settings} />
        <Stack.Screen name="vault" component={Vault} options={screen} />
        {/* Modal */}
        <Stack.Screen name="create" component={Create} options={modal} />
        <Stack.Screen name="viewer" component={Viewer} options={modal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
