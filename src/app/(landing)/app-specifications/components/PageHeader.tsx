import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles/specificationsStyles';

export const PageHeader: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <AntDesign name="left" size={20} color="#6b7280" />
        <Text style={styles.backButtonText}>戻る</Text>
      </TouchableOpacity>
      
      <Text style={styles.pageTitle}>アプリケーション仕様書</Text>
      <Text style={styles.pageSubtitle}>
        Shiftizeの技術仕様と機能詳細を包括的にご紹介
      </Text>
    </View>
  );
};