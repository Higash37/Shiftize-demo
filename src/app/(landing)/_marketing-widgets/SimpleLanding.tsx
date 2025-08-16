import React, { useRef, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

// Components
import { Header } from "./simple-landing/Header";
import { MobileNavigation } from "./simple-landing/MobileNavigation";
import { SectionContainer } from "./simple-landing/SectionContainer";

// Data
import { menuItems } from "./simple-landing/menuItems";

// Types
import { SectionRefs } from "./simple-landing/types";

const SimpleLanding: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  const scrollViewRef = useRef<ScrollView>(null as any);
  const [activeDemo, setActiveDemo] = useState<"mobile" | "desktop">("mobile");
  const [activeSection, setActiveSection] = useState("home");

  const sectionRefs: SectionRefs = {
    home: useRef(null),
    features: useRef(null),
    demo: useRef(null),
    benefits: useRef(null),
    pricing: useRef(null),
    testimonials: useRef(null),
    faq: useRef(null),
  };

  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (section?.current) {
      section.current.measureLayout(
        scrollViewRef.current as any,
        (x: number, y: number) => {
          scrollViewRef.current?.scrollTo({
            y: y - (isMobile ? 80 : 100),
            animated: true,
          });
          setActiveSection(sectionId);
        },
        () => {}
      );
    }
  };

  const handleGetStarted = () => {
    router.push("/(auth)/auth-welcome");
  };

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        menuItems={menuItems}
        activeSection={activeSection}
        isMobile={isMobile}
        onScrollToSection={scrollToSection}
        onGetStarted={handleGetStarted}
      />

      <MobileNavigation
        menuItems={menuItems}
        activeSection={activeSection}
        isMobile={isMobile}
        onScrollToSection={scrollToSection}
        onGetStarted={handleGetStarted}
      />

      <SectionContainer
        sectionRefs={sectionRefs}
        onGetStarted={handleGetStarted}
        scrollViewRef={scrollViewRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default SimpleLanding;