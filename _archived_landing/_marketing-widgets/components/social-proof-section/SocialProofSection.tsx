import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { styles } from "./SocialProofSection.styles";

export const SocialProofSection: React.FC = () => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  const stats = [
    { number: "100+", label: "コンポーネント数", icon: "description" },
    { number: "500+h", label: "開発時間", icon: "access-time" },
    { number: "3種類", label: "対応デバイス", icon: "devices" },
    { number: "5層", label: "セキュリティ機能", icon: "security" },
  ];

  return (
    <View style={[
      styles.heroSocialProof,
      isMobile && styles.heroSocialProofMobile
    ]}>
      <Text style={styles.heroStatsLabel}>導入実績</Text>
      <View style={[
        styles.heroStats,
        isMobile && styles.heroStatsMobile
      ]}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.heroStatItem}>
            <Text style={styles.heroStatNumber}>{stat.number}</Text>
            <Text style={styles.heroStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ミニCTA - 社会的証明の後 */}
      <TouchableOpacity
        style={styles.miniCTA}
        onPress={() => router.push("/(auth)")}
      >
        <Text style={styles.miniCTAText}>実績を見て始めてみる</Text>
        <AntDesign name="arrow-right" size={14} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );
};export default function ComponentPage() { return null; }
