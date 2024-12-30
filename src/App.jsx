import { useFonts } from 'expo-font';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Navigator } from './App.Navigator';
import { StoreProvider } from './contexts';
import { SecretTheme } from './theme/secret.theme';

StyleSheet.build(SecretTheme);

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/EuclidCircularA-Regular.ttf'),
    'font-bold': require('../assets/fonts/EuclidCircularA-SemiBold.ttf'),
    'font-default-secondary': require('../assets/fonts/CanelaText-Regular.otf'),
    'font-bold-secondary': require('../assets/fonts/CanelaText-Bold.otf'),
  });

  return ready ? (
    <StoreProvider>
      <Navigator />
    </StoreProvider>
  ) : null;
};
