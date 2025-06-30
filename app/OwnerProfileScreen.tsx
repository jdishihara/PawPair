// app/OwnerProfileScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OwnerProfileScreen() {
  // later you’ll pull this from context / async storage / API
  const mock = {
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '555-1234',
    emergencyContact: 'Mom: 555-4321',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Owner Profile</Text>
      <Text>Name: {mock.firstName} {mock.lastName}</Text>
      <Text>Phone: {mock.phone}</Text>
      <Text>Emergency Contact: {mock.emergencyContact}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 }
});
