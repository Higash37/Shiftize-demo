import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Hero Section
  heroSection: {
    paddingTop: 20,
    paddingBottom: 80,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },
  heroDesktop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
    maxWidth: 1200,
    alignSelf: "center",
  },
  heroTablet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    maxWidth: 900,
    alignSelf: "center",
  },
  heroMobile: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // Hero Left
  heroLeft: {
    alignItems: "center",
  },
  heroLeftDesktop: {
    flex: 1,
    alignItems: "flex-start",
  },
  heroLeftTablet: {
    flex: 1,
    alignItems: "flex-start",
  },
  heroLeftMobile: {
    alignItems: "center",
  },

  heroBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 40,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },

  heroMainTitle: {
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
    lineHeight: 48,
  },

  heroAccentText: {
    color: "#3b82f6",
  },

  heroSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 28,
    marginBottom: 48,
    maxWidth: 480,
  },

  // 価値提案
  valueProposition: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 48,
    width: "100%",
  },

  valueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },

  valueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  // CTA Container
  heroCTAContainer: {
    gap: 16,
    width: "100%",
  },
  heroCTADesktop: {
    flexDirection: "row",
  },
  heroCTATablet: {
    flexDirection: "row",
  },
  heroCTAMobile: {
    flexDirection: "column",
  },

  heroPrimaryButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 6,
    elevation: 0,
    flex: 1,
  },

  heroPrimaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  heroSecondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },

  heroSecondaryButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },

  // Hero Right
  heroRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heroVisualContainer: {
    alignItems: "center",
    gap: 24,
  },

  heroDeviceMockup: {
    alignItems: "center",
    justifyContent: "center",
  },

  heroPhoneFrame: {
    backgroundColor: "#1f2937",
    padding: 4,
    elevation: 0,
  },

  heroPhoneScreenImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },

  // 技術スタック
  heroTechStack: {
    alignItems: "center",
    gap: 8,
  },

  heroTechLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
  },

  heroTechItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },

  heroTechItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    elevation: 0,
  },

  heroTechDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },

  heroTechText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
});
// Expo Router のルート解決のための default export
export default function StylesPage() {
  return null; // スタイルファイルはルートとして使用しない
}
