import React, { useState, Suspense, lazy } from "react";
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import SimpleHeader from "./SimpleHeader";
import { SectionLoadingFallback } from "./components/SectionLoadingFallback";
import { styles } from "./SimpleLanding.styles";

// DemoModalを遅延読み込み
const DemoModal = lazy(() => 
  import("./DemoModal").then(module => ({ default: module.DemoModal }))
);

// セクションコンポーネントを遅延読み込み
const HeroSection = lazy(() => 
  import("./components/hero-section").then(module => ({ default: module.HeroSection }))
);
const SocialProofSection = lazy(() => 
  import("./components/social-proof-section").then(module => ({ default: module.SocialProofSection }))
);
const FeaturesSection = lazy(() => 
  import("./components/features-section").then(module => ({ default: module.FeaturesSection }))
);
const SecuritySection = lazy(() => 
  import("./components/security-section").then(module => ({ default: module.SecuritySection }))
);
const InteractiveDemoSection = lazy(() => 
  import("./components/interactive-demo-section").then(module => ({ default: module.InteractiveDemoSection }))
);
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
          <Suspense fallback={<SectionLoadingFallback />}>
            <HeroSection onDemoClick={() => setDemoModalVisible(true)} />
          </Suspense>
          <Suspense fallback={<SectionLoadingFallback />}>
            <SocialProofSection />
          </Suspense>
          <Suspense fallback={<SectionLoadingFallback />}>
            <FeaturesSection />
          </Suspense>
          <Suspense fallback={<SectionLoadingFallback />}>
            <SecuritySection />
          </Suspense>
          <Suspense fallback={<SectionLoadingFallback />}>
            <InteractiveDemoSection onDemoClick={() => setDemoModalVisible(true)} />
          </Suspense>

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

      {demoModalVisible && (
        <Suspense fallback={null}>
          <DemoModal visible={demoModalVisible} onClose={() => setDemoModalVisible(false)} />
        </Suspense>
      )}
    </View>
  );
};

export default SimpleLanding;
