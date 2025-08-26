import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { styles } from "./features-section.styles";

export const FeaturesSection: React.FC = () => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  // デバイス判定
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  // 授業・シフト両対応機能
  const enterpriseFeatures = [
    {
      icon: "calendar",
      title: "シフト管理機能",
      description: "直感的なガントチャート表示でシフトを効率的に管理",
      details: [
        "ガントチャート表示",
        "モーダルで簡単編集",
        "月次・週次ビュー",
        "シフト重複チェック",
      ],
      color: "#3B82F6",
      bgColor: "#EBF8FF",
    },
    {
      icon: "people",
      title: "権限管理システム",
      description: "Master/User権限による適切なアクセス制御",
      details: [
        "マスター/ユーザー権限分離",
        "承認フロー機能",
        "セキュアな認証",
        "監査ログ",
      ],
      color: "#10B981",
      bgColor: "#F0FDF4",
    },
    {
      icon: "attach-money",
      title: "給与計算機能",
      description: "複雑な給与体系にも対応した自動計算システム",
      details: [
        "自動計算システム",
        "税込み/税抜き切り替え",
        "CSV出力機能",
        "月次集計レポート",
      ],
      color: "#8B5CF6",
      bgColor: "#FAF5FF",
    },
    {
      icon: "flash-on",
      title: "リアルタイム同期",
      description: "Firebase連携による即座のデータ反映",
      details: [
        "Firebase連携",
        "即時データ反映",
        "オフライン対応",
        "リアルタイム通知",
      ],
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ];

  return (
    <View style={[
      styles.featuresSection,
      isMobile && styles.featuresSectionMobile
    ]}>
      <View style={styles.sectionContentWrapper}>
        <Text style={[
          styles.sectionTitle,
          isMobile && styles.sectionTitleMobile
        ]}>
          <Text style={styles.gradientText}>
            授業とシフト、両方に対応した機能
          </Text>
        </Text>
        <Text style={[
          styles.sectionSubtitle,
          isMobile && styles.sectionSubtitleMobile
        ]}>
          学習塾特有の「授業時間」と「シフト時間」の違いを理解した、専用設計のシステムです。
        </Text>

        {/* 左右交互レイアウトの機能紹介 */}
        {enterpriseFeatures.map((feature, index) => (
          <View
            key={index}
            style={[
              styles.featureRow,
              index % 2 === 1 && styles.featureRowReverse,
              isMobile && styles.featureRowMobile,
            ]}
          >
            {/* コンテンツ側 */}
            <View style={styles.featureContent}>
              <View style={styles.featureIconWrapper}>
                <MaterialIcons
                  name={feature.icon as any}
                  size={40}
                  color={feature.color}
                />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>

              <View style={styles.featureDetailsList}>
                {feature.details.map((detail, detailIndex) => (
                  <View
                    key={detailIndex}
                    style={styles.featureDetailItem}
                  >
                    <View
                      style={[
                        styles.featureDetailDot,
                        { backgroundColor: feature.color },
                      ]}
                    />
                    <Text style={styles.featureDetailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ビジュアル側 */}
            {!isMobile && (
              <View
                style={[
                  styles.featureVisual,
                  { backgroundColor: feature.bgColor },
                ]}
              >
                <View style={styles.featureVisualContent}>
                  <MaterialIcons
                    name={feature.icon as any}
                    size={80}
                    color={feature.color}
                  />
                </View>
              </View>
            )}
          </View>
        ))}

        {/* 機能紹介後のCTA - 緊急性を演出 */}
        <View style={styles.urgencyCTAContainer}>
          <View style={styles.urgencyBadge}>
            <MaterialIcons
              name="local-fire-department"
              size={20}
              color="#ef4444"
            />
            <Text style={styles.urgencyBadgeText}>期間限定</Text>
          </View>
          <Text style={styles.urgencyCTATitle}>
            今なら初月無料でお試しいただけます
          </Text>
          <Text style={styles.urgencyCTASubtitle}>
            授業・シフト両対応の全機能を30日間無料で体験
          </Text>
          <TouchableOpacity
            style={styles.urgencyCTAButton}
            onPress={() => router.push("/(auth)")}
          >
            <Text style={styles.urgencyCTAButtonText}>無料で始める</Text>
            <View style={styles.urgencyCTAArrow}>
              <AntDesign name="arrowright" size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.urgencyCTANote}>
            ※ クレジットカード不要・いつでも解約可能
          </Text>
        </View>
      </View>
    </View>
  );
};export default function ComponentPage() { return null; }
