import React from 'react';
import { View, Text } from 'react-native';
import { featuresData } from '../data/specificationsData';
import { styles } from '../styles/specificationsStyles';

export const FeaturesTab: React.FC = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabDescription}>
      各機能の詳細な仕様とビジネスロジックをご紹介します。
      塾・学習塾に特化した機能設計により、実際の運用に即した機能を提供しています。
    </Text>
    
    {featuresData.map((feature, index) => (
      <View key={index} style={styles.featureSection}>
        <Text style={styles.featureSectionTitle}>{feature.category}</Text>
        <Text style={styles.featureSectionDescription}>{feature.description}</Text>
        <View style={styles.specificationsList}>
          {feature.specifications.map((spec, specIndex) => (
            <View key={specIndex} style={styles.specificationItem}>
              <View style={styles.specificationDot} />
              <Text style={styles.specificationText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>
    ))}
  </View>
);