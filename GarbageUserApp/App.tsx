import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import ReportGarbageScreen from './src/screens/ReportGarbageScreen';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ReportGarbageScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;