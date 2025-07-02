// app/MessagesScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen() {
  // later you’ll wire this up to real chat data
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <Text style={styles.subtext}>No conversations yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20
  },
  header: {
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16
  },
  subtext: {
    fontSize: 16, 
    color: '#666'
  }
});
