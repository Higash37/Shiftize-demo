import React from 'react';
import { View, Text } from 'react-native';
import { architectureData } from '../data/specificationsData';
import { styles } from '../styles/specificationsStyles';

export const ArchitectureTab: React.FC = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabDescription}>
      Shiftizeは最新のクロスプラットフォーム技術とクラウドサービスを組み合わせた、
      スケーラブルで保守性の高いアーキテクチャを採用しています。
    </Text>
    
    {Object.entries(architectureData).map(([key, section]) => (
      <View key={key} style={styles.architectureSection}>
        <Text style={styles.architectureSectionTitle}>{section.title}</Text>
        {section.items.map((item, index) => (
          <View key={index} style={styles.architectureItem}>
            <View style={styles.architectureItemHeader}>
              <Text style={styles.architectureItemName}>{item.name}</Text>
              <Text style={styles.architectureItemVersion}>{item.version}</Text>
            </View>
            <Text style={styles.architectureItemDescription}>{item.description}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);