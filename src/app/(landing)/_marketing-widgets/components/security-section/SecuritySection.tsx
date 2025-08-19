import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./security-section.styles";

export const SecuritySection: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  return (
    <View style={[
      styles.securitySection,
      isMobile && styles.securitySectionMobile
    ]}>
      <View style={[
        styles.securityBadges,
        isMobile && styles.securityBadgesMobile
      ]}>
        <View style={styles.securityBadge}>
          <MaterialIcons name="security" size={32} color="#3b82f6" />
          <Text style={styles.securityBadgeTitle}>SSL暗号化</Text>
          <Text style={styles.securityBadgeText}>通信は全て暗号化</Text>
        </View>
        <View style={styles.securityBadge}>
          <MaterialIcons name="verified-user" size={32} color="#10b981" />
          <Text style={styles.securityBadgeTitle}>GDPR準拠</Text>
          <Text style={styles.securityBadgeText}>個人情報保護対応</Text>
        </View>
        <View style={styles.securityBadge}>
          <MaterialIcons name="lock" size={32} color="#8b5cf6" />
          <Text style={styles.securityBadgeTitle}>ISO27001</Text>
          <Text style={styles.securityBadgeText}>
            情報セキュリティ認証
          </Text>
        </View>
        <View style={styles.securityBadge}>
          <MaterialIcons name="cloud-done" size={32} color="#ef4444" />
          <Text style={styles.securityBadgeTitle}>99.9% 稼働率</Text>
          <Text style={styles.securityBadgeText}>
            安定したサービス提供
          </Text>
        </View>
      </View>
    </View>
  );
};export default function ComponentPage() { return null; }
