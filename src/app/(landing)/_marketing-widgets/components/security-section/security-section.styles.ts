import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Security Section
  securitySection: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: "#f8faff",
  },

  securitySectionMobile: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  securityBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 32,
    justifyContent: "center",
    maxWidth: 1000,
    alignSelf: "center",
  },

  securityBadgesMobile: {
    gap: 24,
    flexDirection: "column",
  },

  securityBadge: {
    alignItems: "center",
    width: 200,
  },

  securityBadgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 12,
    marginBottom: 4,
  },

  securityBadgeText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});