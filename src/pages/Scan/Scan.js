import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components';

export function ScanScreen() {
  const onPressButton = () => {
    console.log('Button pressed');
  };

  return (
    <View style={styles.container}>
      <Text>Scan Screen</Text>
      <Button title="Button test" onPress={onPressButton} />
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
