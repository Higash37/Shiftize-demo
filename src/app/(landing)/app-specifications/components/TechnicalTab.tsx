import React from 'react';
import { View, Text } from 'react-native';
import { technicalData } from '../data/specificationsData';
import { styles } from '../styles/specificationsStyles';

export const TechnicalTab: React.FC = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabDescription}>
      モダンな開発手法とベストプラクティスを採用した技術実装の詳細。
      保守性・拡張性・パフォーマンスを重視した設計思想をご紹介します。
    </Text>
    
    {technicalData.map((tech, index) => (
      <View key={index} style={styles.technicalSection}>
        <Text style={styles.technicalTitle}>{tech.category}</Text>
        <Text style={styles.technicalDescription}>{tech.description}</Text>
        <View style={styles.technicalDetails}>
          {tech.details.map((detail, detailIndex) => (
            <View key={detailIndex} style={styles.technicalDetailItem}>
              <View style={styles.technicalDetailDot} />
              <Text style={styles.technicalDetailText}>{detail}</Text>
            </View>
          ))}
        </View>
      </View>
    ))}
  </View>
);