import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { OnboardingStorage } from "@/services/storage/onboarding";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Button from "@/common/common-ui/ui-forms/FormButton";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  title: string;
  description: string;
  backgroundColor: string;
}

const slides: OnboardingSlide[] = [
  {
    title: "Shiftizeへようこそ",
    description:
      "シフト管理を簡単に、効率的に。\nあなたのチームのスケジュール管理をサポートします。",
    backgroundColor: colors.primary,
  },
  {
    title: "シンプルなシフト作成",
    description:
      "ドラッグ&ドロップで簡単にシフトを作成。\n直感的な操作でスケジュール管理ができます。",
    backgroundColor: colors.secondary,
  },
  {
    title: "リアルタイム共有",
    description:
      "チームメンバーとリアルタイムでシフトを共有。\n変更もすぐに反映されます。",
    backgroundColor: colors.selected,
  },
];

export const OnboardingScreen: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    await OnboardingStorage.setOnboardingCompleted();
    router.replace("/(auth)/welcome");
  };

  const slide = slides[currentSlide];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: slide?.backgroundColor ?? "#ffffff" },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={styles.skipText}>スキップ</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{slide?.title ?? ""}</Text>
          <Text style={styles.description}>{slide?.description ?? ""}</Text>
        </View>

        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentSlide ? styles.activeIndicator : null,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={currentSlide === slides.length - 1 ? "始める" : "次へ"}
            onPress={nextSlide}
            variant="outline"
            size="large"
            fullWidth
          />
        </View>
      </SafeAreaView>

      {/* Bottom Rounded Corner Overlay */}
      <View
        style={[styles.bottomOverlay, { backgroundColor: colors.surface }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: layout.padding.large,
    paddingBottom: layout.padding.large,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderTopLeftRadius: layout.borderRadius.large,
    borderTopRightRadius: layout.borderRadius.large,
  },
  skipButton: {
    alignSelf: "flex-end",
    padding: layout.padding.small,
    marginTop: layout.padding.small,
  },
  skipText: {
    color: colors.text.white,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as any,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: layout.padding.large,
  },
  title: {
    fontSize: typography.fontSize.xxlarge + 4, // 28px equivalent
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.white,
    textAlign: "center",
    marginBottom: layout.padding.large,
  },
  description: {
    fontSize: typography.fontSize.large,
    color: colors.text.white,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: layout.padding.large * 1.5,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: layout.borderRadius.small,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: layout.padding.small / 2,
  },
  activeIndicator: {
    backgroundColor: colors.text.white,
  },
  buttonContainer: {
    paddingHorizontal: layout.padding.large,
  },
  nextButton: {
    backgroundColor: colors.background,
    paddingVertical: typography.fontSize.medium,
    paddingHorizontal: layout.padding.large,
    borderRadius: layout.borderRadius.large + 13, // 25px equivalent
    alignSelf: "center",
    minWidth: 120,
    ...shadows.medium,
  },
  nextText: {
    color: colors.primary,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as any,
    textAlign: "center",
  },
});
