import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Demo Section Styles
  demoSection: {
    paddingVertical: 100,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },

  demoSectionMobile: {
    paddingHorizontal: 20,
    paddingVertical: 60,
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

  // Soft CTA
  softCTAContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  softCTATitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },

  softCTAButtons: {
    flexDirection: "row",
    gap: 16,
  },

  softCTAPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  softCTAPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  softCTASecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },

  softCTASecondaryText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
});