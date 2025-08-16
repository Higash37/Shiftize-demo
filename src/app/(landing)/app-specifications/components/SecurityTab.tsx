import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { securityData } from '../data/specificationsData';
import { styles } from '../styles/specificationsStyles';

export const SecurityTab: React.FC = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabDescription}>
      エンタープライズレベルのセキュリティ対策を実装。
      GDPR準拠、AES-256暗号化、包括的な監査システムにより、最高水準のデータ保護を実現しています。
    </Text>
    
    {securityData.map((security, index) => (
      <View key={index} style={styles.securitySection}>
        <View style={styles.securityHeader}>
          <Text style={styles.securityTitle}>{security.category}</Text>
          <View style={[styles.securityLevel, 
            security.level === '最高レベル' ? { backgroundColor: '#DC2626' } :
            security.level === '完全対応' ? { backgroundColor: '#10B981' } :
            { backgroundColor: '#3B82F6' }
          ]}>
            <Text style={styles.securityLevelText}>{security.level}</Text>
          </View>
        </View>
        <View style={styles.securitySpecs}>
          {security.specifications.map((spec, specIndex) => (
            <View key={specIndex} style={styles.securitySpecItem}>
              <MaterialIcons name="verified" size={16} color="#10B981" />
              <Text style={styles.securitySpecText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>
    ))}
  </View>
);