import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Features
  featuresSection: {
    paddingVertical: 100,
    paddingHorizontal: 40,
    backgroundColor: "#f8faff",
  },

  featuresSectionMobile: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 24,
  },

  sectionTitleMobile: {
    fontSize: 24,
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

  sectionSubtitleMobile: {
    fontSize: 16,
    marginBottom: 40,
    paddingHorizontal: 8,
  },

  sectionContentWrapper: {
    maxWidth: 1000,
    width: "100%",
    alignSelf: "center",
  },

  // 左右交互レイアウトのスタイル
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 80,
    gap: 60,
  },

  featureRowReverse: {
    flexDirection: "row-reverse",
  },

  featureRowMobile: {
    flexDirection: "column",
    gap: 24,
  },

  featureContent: {
    flex: 1,
  },

  featureIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  featureTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },

  featureDescription: {
    fontSize: 18,
    color: "#6b7280",
    lineHeight: 28,
    marginBottom: 32,
  },

  featureDetailsList: {
    gap: 16,
  },

  featureVisual: {
    flex: 1,
    height: 400,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 0,
  },

  featureVisualContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  featureDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  featureDetailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  featureDetailText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },

  // Urgency CTA
  urgencyCTAContainer: {
    backgroundColor: "#fff7ed",
    borderRadius: 20,
    padding: 40,
    marginTop: 60,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fed7aa",
  },

  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
  },

  urgencyBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },

  urgencyCTATitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
  },

  urgencyCTASubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },

  urgencyCTAButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 12,
    gap: 12,
    elevation: 0,
  },

  urgencyCTAButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  urgencyCTAArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 4,
  },

  urgencyCTANote: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 16,
  },
});

// Expo Router のルート解決のための default export
export default function StylesPage() {
  return null; // スタイルファイルはルートとして使用しない
}