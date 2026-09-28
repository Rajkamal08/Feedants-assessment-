import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';
import { COLORS } from './src/constants/theme';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CompetitionDetailsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
