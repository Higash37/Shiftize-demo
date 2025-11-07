import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import SimpleHeader from "./SimpleHeader";
import { DemoModal } from "./DemoModal";
import { HeroSection } from "./components/hero-section";
import { SocialProofSection } from "./components/social-proof-section";
import { FeaturesSection } from "./components/features-section";
import { SecuritySection } from "./components/security-section";
import { InteractiveDemoSection } from "./components/interactive-demo-section";
import { styles } from "./SimpleLanding.styles";
import {
  finalCtaFeatures,
  navigationMenu,
  updateHistory,
  updateTypeMeta,
} from "./SimpleLanding.data";

const CTA_CHECK_ICON_COLOR = updateTypeMeta.feature.color;

const SimpleLanding: React.FC = () => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [demoModalVisible, setDemoModalVisible] = useState(false);

  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  return (
    <View style={styles.container}>
      <SimpleHeader />
      <View style={styles.mainLayout}>
        {(isDesktop || isTablet) && (
          <View style={styles.leftSidebar}>
            <View style={styles.sidebarHeader}>
              <MaterialIcons name="menu" size={20} color={colors.primary} />
              <Text style={styles.sidebarTitle}>導線リスト</Text>
            </View>

            <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
              {navigationMenu.map((category) => (
                <View key={category.category} style={styles.navCategory}>
                  <Text style={styles.navCategoryTitle}>{category.category}</Text>
                  {category.items.map((item) => (
                    <View key={item.title} style={[styles.navItem, styles.navItemDisabled]}>
                      <View style={styles.navItemIconContainer}>
                        <MaterialIcons
                          name={item.icon}
                          size={18}
                          color={colors.text.secondary}
                        />
                        <View style={styles.navItemSlash} />
                      </View>
                      <View style={styles.navItemContent}>
                        <Text style={styles.navItemTitleDisabled}>{item.title}</Text>
                        <Text style={styles.navItemDescriptionDisabled}>準備中 - {item.description}</Text>
                      </View>
                      <MaterialIcons name="lock" size={16} color={colors.text.disabled} />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          <HeroSection onDemoClick={() => setDemoModalVisible(true)} />
          <SocialProofSection />
          <FeaturesSection />
          <SecuritySection />
          <InteractiveDemoSection onDemoClick={() => setDemoModalVisible(true)} />

          <View style={styles.finalCTA}>
            <View style={styles.finalCTAContent}>
              <Text style={styles.finalCTAHeadline}>もうシフト管理で悩む必要はありません</Text>
              <Text style={styles.finalCTASubheadline}>100 校以上の学習塾が選んだシフト管理システム</Text>

              <View style={styles.finalCTAFeatures}>
                {finalCtaFeatures.map((feature) => (
                  <View key={feature} style={styles.finalCTAFeatureItem}>
                    <MaterialIcons name="check-circle" size={20} color={CTA_CHECK_ICON_COLOR} />
                    <Text style={styles.finalCTAFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.finalCTAButton} onPress={() => router.push("/(auth)")}>
                <View style={styles.finalCTAButtonContent}>
                  <Text style={styles.finalCTAButtonText}>今すぐ始める</Text>
                  <Text style={styles.finalCTAButtonSubtext}>3 分で完了</Text>
                </View>
                <View style={styles.finalCTAButtonArrow}>
                  <AntDesign name="arrow-right" size={24} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <Text style={styles.finalCTATrust}>
                <MaterialIcons name="shield" size={16} color={colors.text.secondary} />{" "}
                SSL 暗号化通信・データは安全に保護されています
              </Text>
            </View>
          </View>
        </ScrollView>

        {(isDesktop || isTablet) && (
          <View style={styles.rightSidebar}>
            <View style={styles.sidebarHeader}>
              <MaterialIcons name="timeline" size={20} color={colors.primary} />
              <Text style={styles.sidebarTitle}>更新履歴</Text>
            </View>

            <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
              {updateHistory.map((update, index) => {
                const meta = updateTypeMeta[update.type];
                const isLastItem = index === updateHistory.length - 1;

                return (
                  <View key={update.id} style={styles.updateItem}>
                    <View style={styles.timelineContainer}>
                      <View style={[styles.timelineDot, { backgroundColor: meta.color }]} />
                      {!isLastItem && <View style={styles.timelineLine} />}
                    </View>

                    <View style={styles.updateContent}>
                      <View style={styles.updateHeader}>
                        <Text style={styles.updateVersion}>{update.version}</Text>
                        <Text style={styles.updateDate}>{update.date}</Text>
                      </View>

                      <View style={styles.updateTitleRow}>
                        <Text style={styles.updateIcon}>{meta.icon}</Text>
                        <Text style={styles.updateTitle}>{update.title}</Text>
                      </View>

                      <Text style={styles.updateDescription}>{update.description}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <DemoModal visible={demoModalVisible} onClose={() => setDemoModalVisible(false)} />
    </View>
  );
};

export default SimpleLanding;
