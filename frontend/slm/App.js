import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import ChatScreen from './src/screens/chatscreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1117', // A sleek dark theme background
  },
});