import { StyleSheet } from "react-native";

// 分割されたコンポーネント用の共通スタイル
export const commonLandingStyles = StyleSheet.create({
  // セクション共通スタイル
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 24,
  },

  gradientText: {
    color: "#3b82f6",
  },

  sectionSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 80,
    maxWidth: 800,
    alignSelf: "center",
    lineHeight: 32,
  },

  sectionContentWrapper: {
    maxWidth: 1000,
    width: "100%",
    alignSelf: "center",
  },

  // レスポンシブヘルパー
  responsiveContainer: {
    paddingHorizontal: 20,
  },

  responsiveContainerDesktop: {
    paddingHorizontal: 40,
  },

  responsiveContainerMobile: {
    paddingHorizontal: 16,
  },

  // セクション共通パディング
  sectionPadding: {
    paddingVertical: 80,
    paddingHorizontal: 40,
  },

  sectionPaddingMobile: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
});

// レスポンシブヘルパー関数
export const getResponsiveStyles = (screenWidth: number) => {
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  return {
    isDesktop,
    isTablet,
    isMobile,
    containerPadding: isMobile ? 16 : isTablet ? 24 : 40,
    sectionPadding: isMobile ? 60 : 80,
    titleFontSize: isMobile ? 24 : isTablet ? 28 : 32,
    subtitleFontSize: isMobile ? 16 : 18,
  };
};