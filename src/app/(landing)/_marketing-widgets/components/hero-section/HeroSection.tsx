import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { styles } from "./hero-section.styles";

// 画像は既にプレースホルダーに置き換え済み

interface HeroSectionProps {
  onDemoClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onDemoClick }) => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  // デバイス判定
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  // 動的スタイル
  const dynamicStyles = {
    heroPhoneFrame: {
      width: isTablet ? 200 : 260,
      height: isTablet ? 344 : 447,
      borderRadius: isTablet ? 16 : 22,
    },
    heroMainTitle: {
      fontSize: isMobile ? 25 : isTablet ? 32 : 38,
      textAlign: (isDesktop || isTablet ? "left" : "center") as
        | "left"
        | "center",
    },
    heroSubtitle: {
      textAlign: (isDesktop || isTablet ? "left" : "center") as
        | "left"
        | "center",
    },
  };

  // 技術スタック
  const techStack = [
    { name: "React Native", color: "#61DAFB" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "Firebase", color: "#FF6F00" },
    { name: "Expo", color: "#000020" },
  ];

  return (
    <View
      style={[
        styles.heroSection,
        isDesktop
          ? styles.heroDesktop
          : isTablet
          ? styles.heroTablet
          : styles.heroMobile,
      ]}
    >
      {/* 左側：テキストコンテンツ */}
      <View
        style={[
          styles.heroLeft,
          isDesktop
            ? styles.heroLeftDesktop
            : isTablet
            ? styles.heroLeftTablet
            : styles.heroLeftMobile,
        ]}
      >
        <Text style={styles.heroBadge}>
          ✨ 授業時間とシフト時間両方組める
        </Text>

        <Text style={[styles.heroMainTitle, dynamicStyles.heroMainTitle]}>
          シフト作成、{"\n"}
          <Text style={styles.heroAccentText}>もう悩まない。</Text>
        </Text>

        <Text style={[styles.heroSubtitle, dynamicStyles.heroSubtitle]}>
          3分で完了するシフト管理。{"\n"}
          塾・学習塾に特化した本格SaaSソリューション。
        </Text>

        {/* 価値提案 */}
        <View style={styles.valueProposition}>
          <View style={styles.valueItem}>
            <MaterialIcons name="schedule" size={20} color="#10B981" />
            <Text style={styles.valueText}>作業時間 90%短縮</Text>
          </View>
          <View style={styles.valueItem}>
            <MaterialIcons name="people" size={20} color="#3B82F6" />
            <Text style={styles.valueText}>複数デバイス対応</Text>
          </View>
          <View style={styles.valueItem}>
            <MaterialIcons name="schedule" size={20} color="#8B5CF6" />
            <Text style={styles.valueText}>授業・シフト両対応</Text>
          </View>
        </View>

        {/* CTA */}
        <View
          style={[
            styles.heroCTAContainer,
            isDesktop
              ? styles.heroCTADesktop
              : isTablet
              ? styles.heroCTATablet
              : styles.heroCTAMobile,
          ]}
        >
          <TouchableOpacity
            style={styles.heroPrimaryButton}
            onPress={() => router.push("/(auth)")}
          >
            <Text style={styles.heroPrimaryButtonText}>
              今すぐ無料で始める
            </Text>
            <AntDesign name="arrowright" size={16} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.heroSecondaryButton}
            onPress={onDemoClick}
          >
            <AntDesign name="playcircleo" size={16} color="#3b82f6" />
            <Text style={styles.heroSecondaryButtonText}>デモを見る</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 右側：ビジュアル（デスクトップ・タブレット） */}
      {(isDesktop || isTablet) && (
        <View style={styles.heroRight}>
          <View style={styles.heroVisualContainer}>
            {/* メインビジュアル */}
            <View style={styles.heroDeviceMockup}>
              <View
                style={[
                  styles.heroPhoneFrame,
                  dynamicStyles.heroPhoneFrame,
                ]}
              >
                <View style={[styles.heroPhoneScreenImage, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
                  <MaterialIcons name="smartphone" size={40} color="#6b7280" />
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>画像読み込み中...</Text>
                </View>
              </View>
            </View>

            {/* 技術スタック */}
            <View style={styles.heroTechStack}>
              <Text style={styles.heroTechLabel}>Powered by</Text>
              <View style={styles.heroTechItems}>
                {techStack.map((tech, index) => (
                  <View
                    key={index}
                    style={[
                      styles.heroTechItem,
                      { borderColor: tech.color },
                    ]}
                  >
                    <View
                      style={[
                        styles.heroTechDot,
                        { backgroundColor: tech.color },
                      ]}
                    />
                    <Text style={styles.heroTechText}>{tech.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};