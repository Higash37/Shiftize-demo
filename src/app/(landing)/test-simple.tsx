import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestSimple() {
  console.log('TestSimple component loaded');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Simple Page</Text>
      <Text style={styles.subtitle}>この画面が表示されれば、ルーティングは正常です</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});