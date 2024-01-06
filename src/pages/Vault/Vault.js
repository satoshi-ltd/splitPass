import { StyleSheet, Text, View } from 'react-native';

export function VaultScreen() {
  return (
    <View style={styles.container}>
      <Text>Vault Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
