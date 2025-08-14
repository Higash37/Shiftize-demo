import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { InteractiveDemoViewer } from "../interactive-demo-viewer";
import { styles } from "./interactive-demo-section.styles";

interface InteractiveDemoSectionProps {
  onDemoClick: () => void;
}

export const InteractiveDemoSection: React.FC<InteractiveDemoSectionProps> = ({
  onDemoClick,
}) => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  return (
    <View style={[
      styles.demoSection,
      isMobile && styles.demoSectionMobile
    ]}>
      <View style={styles.sectionContentWrapper}>
        <Text style={[
          styles.sectionTitle,
          isMobile && styles.sectionTitleMobile
        ]}>
          <Text style={styles.gradientText}>3つの表示形式を体験</Text>
        </Text>
        <Text style={[
          styles.sectionSubtitle,
          isMobile && styles.sectionSubtitleMobile
        ]}>
          デバイスに最適化された表示モードで、どんな環境でもシフト管理が快適です。
        </Text>

        <InteractiveDemoViewer onDemoClick={onDemoClick} />

        {/* デモ後のソフトCTA */}
        <View style={styles.softCTAContainer}>
          <Text style={styles.softCTATitle}>
            実際のアプリでもっと詳しく
          </Text>
          <View style={styles.softCTAButtons}>
            <TouchableOpacity
              style={styles.softCTAPrimary}
              onPress={() => router.push("/(auth)")}
            >
              <MaterialIcons
                name="rocket-launch"
                size={20}
                color="#ffffff"
              />
              <Text style={styles.softCTAPrimaryText}>
                アプリを始める
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.softCTASecondary}
              onPress={onDemoClick}
            >
              <MaterialIcons
                name="play-circle-outline"
                size={20}
                color="#3b82f6"
              />
              <Text style={styles.softCTASecondaryText}>
                デモ環境で試す
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};