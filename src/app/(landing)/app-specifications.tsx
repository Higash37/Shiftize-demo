import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SimpleHeader from "./_marketing-widgets/SimpleHeader";
import { colors } from "@/common/common-constants/ThemeConstants";
import { createAppSpecificationsStyles } from "./AppSpecifications.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import {
  architectureData,
  featuresData,
  securityData,
  tabs,
  technicalData,
} from "./AppSpecifications.data";
import type { TabId } from "./AppSpecifications.types";

const securityLevelColors: Record<string, string> = {
  "�ō����x��": colors.error,
  "���S�Ή�": colors.success,
  "�G���^�[�v���C�Y��": colors.primary,
};

const AppSpecifications = () => {
  const router = useRouter();
  const styles = useThemedStyles(createAppSpecificationsStyles);
  const [activeTab, setActiveTab] = useState<TabId>("architecture");

  // タブデータ
  const renderArchitecture = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Shiftizeは最新のクロスプラットフォーム技術とクラウドサービスを組み合わせた、
        スケーラブルで保守性の高いアーキテクチャを採用しています。
      </Text>

      {Object.entries(architectureData).map(([key, section]) => (
        <View key={key} style={styles.architectureSection}>
          <Text style={styles.architectureSectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <View key={item.name} style={styles.architectureItem}>
              <View style={styles.architectureItemHeader}>
                <Text style={styles.architectureItemName}>{item.name}</Text>
                <Text style={styles.architectureItemVersion}>
                  {item.version}
                </Text>
              </View>
              <Text style={styles.architectureItemDescription}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        各機能の詳細な仕様とビジネスロジックをご紹介します。
        塾・学習塾に特化した機能設計により、実際の運用に即した機能を提供しています。
      </Text>

      {featuresData.map((feature) => (
        <View key={feature.category} style={styles.featureSection}>
          <Text style={styles.featureSectionTitle}>{feature.category}</Text>
          <Text style={styles.featureSectionDescription}>
            {feature.description}
          </Text>
          <View style={styles.specificationsList}>
            {feature.specifications.map((spec) => (
              <View key={spec} style={styles.specificationItem}>
                <View style={styles.specificationDot} />
                <Text style={styles.specificationText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderSecurity = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        エンタープライズレベルのセキュリティ対策を実装。
        GDPR準拠、AES-256暗号化、包括的な監査システムにより、最高水準のデータ保護を実現しています。
      </Text>

      {securityData.map((security) => (
        <View key={security.category} style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Text style={styles.securityTitle}>{security.category}</Text>
            <View
              style={[
                styles.securityLevel,
                { backgroundColor: securityLevelColors[security.level] ?? colors.primary },
              ]}
            >
              <Text style={styles.securityLevelText}>{security.level}</Text>
            </View>
          </View>
          <View style={styles.securitySpecs}>
            {security.specifications.map((spec) => (
              <View key={spec} style={styles.securitySpecItem}>
                <MaterialIcons name="verified" size={16} color={colors.success} />
                <Text style={styles.securitySpecText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderTechnical = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        モダンな開発手法とベストプラクティスを採用した技術実装の詳細。
        保守性・拡張性・パフォーマンスを重視した設計思想をご紹介します。
      </Text>

      {technicalData.map((tech) => (
        <View key={tech.category} style={styles.technicalSection}>
          <Text style={styles.technicalTitle}>{tech.category}</Text>
          <Text style={styles.technicalDescription}>{tech.description}</Text>
          <View style={styles.technicalDetails}>
            {tech.details.map((detail) => (
              <View key={detail} style={styles.technicalDetailItem}>
                <View style={styles.technicalDetailDot} />
                <Text style={styles.technicalDetailText}>{detail}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <SimpleHeader />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="left" size={20} color={colors.text.secondary} />
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>アプリケーション仕様書</Text>
          <Text style={styles.pageSubtitle}>
            Shiftizeの技術仕様と機能詳細を包括的にご紹介
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, styles.containerMax]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <MaterialIcons
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? colors.primary : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={[styles.contentContainer, styles.containerMax]}>
          {activeTab === "architecture" && renderArchitecture()}
          {activeTab === "features" && renderFeatures()}
          {activeTab === "security" && renderSecurity()}
          {activeTab === "technical" && renderTechnical()}
        </View>
      </ScrollView>
    </View>
  );
};

export default AppSpecifications;
