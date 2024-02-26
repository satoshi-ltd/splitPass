import { useFonts } from 'expo-font';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Navigator } from './App.Navigator';
import { StoreProvider } from './contexts';
import { SecretTheme } from './theme/secret.theme';

StyleSheet.build(SecretTheme);

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/Poppins-Regular.ttf'),
    'font-bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'font-accentuate': require('../assets/fonts/PPFragment-Glare-Regular.otf'),
  });

  return ready ? (
    <StoreProvider>
      <Navigator />
    </StoreProvider>
  ) : null;
};
