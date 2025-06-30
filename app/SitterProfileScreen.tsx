// app/SitterProfileScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SitterProfileScreen() {
  const mock = {
    firstName: 'Alex',
    lastName: 'Smith',
    phone: '555-9876',
    experience: '5 years with labs & retrievers',
    maxDistance: 10,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sitter Profile</Text>
      <Text>Name: {mock.firstName} {mock.lastName}</Text>
      <Text>Phone: {mock.phone}</Text>
      <Text>Experience: {mock.experience}</Text>
      <Text>Max Distance: {mock.maxDistance} miles</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 }
});
