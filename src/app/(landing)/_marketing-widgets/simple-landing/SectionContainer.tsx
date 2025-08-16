import React from "react";
import { View, ScrollView } from "react-native";
import { SectionRefs } from "./types";

// Components
import CTA from "../CTA";
import Benefits from "../Benefits";
import Pricing from "../Pricing";
import Testimonials from "../Testimonials";
import { HeroSection } from "../components/hero-section/HeroSection";
import { FeaturesSection } from "../components/features-section/FeaturesSection";
import { InteractiveDemoViewer } from "../components/interactive-demo-viewer/InteractiveDemoViewer";
import Footer from "../Footer";

interface SectionContainerProps {
  sectionRefs: SectionRefs;
  onGetStarted: () => void;
  scrollViewRef: React.RefObject<ScrollView>;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  sectionRefs,
  onGetStarted,
  scrollViewRef,
}) => {
  const containerStyle = {
    flex: 1,
    paddingTop: 80,
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={containerStyle}
      showsVerticalScrollIndicator={false}
    >
      {/* ヘッダーセクション */}
      <View ref={sectionRefs.home}>
        <HeroSection onDemoClick={onGetStarted} />
      </View>

      {/* 機能セクション */}
      <View ref={sectionRefs.features}>
        <FeaturesSection />
      </View>

      {/* インタラクティブデモセクション */}
      <View ref={sectionRefs.demo}>
        <InteractiveDemoViewer onDemoClick={onGetStarted} />
      </View>

      {/* 導入効果セクション */}
      <View ref={sectionRefs.benefits}>
        <Benefits />
      </View>

      {/* 料金セクション */}
      <View ref={sectionRefs.pricing}>
        <Pricing />
      </View>

      {/* 導入事例セクション */}
      <View ref={sectionRefs.testimonials}>
        <Testimonials />
      </View>

      {/* CTAセクション */}
      <View ref={sectionRefs.faq}>
        <CTA />
      </View>

      {/* フッター */}
      <Footer />
    </ScrollView>
  );
};