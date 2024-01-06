import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { GenerateScreen, ScanScreen, SettingsScreen, VaultScreen } from './src';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator>
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Generate" component={GenerateScreen} />
        <Tab.Screen name="Vault" component={VaultScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
