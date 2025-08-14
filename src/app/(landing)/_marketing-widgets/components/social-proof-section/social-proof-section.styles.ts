import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // 社会的証明
  heroSocialProof: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },

  heroSocialProofMobile: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },

  heroStatsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 16,
  },

  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 80,
  },

  heroStatsMobile: {
    gap: 40,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  heroStatItem: {
    alignItems: "center",
    minWidth: 80,
  },

  heroStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },

  heroStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },

  // CTA Styles
  miniCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },

  miniCTAText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
});