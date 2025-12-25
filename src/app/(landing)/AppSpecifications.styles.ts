import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { responsiveStyles } from "./utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: responsiveStyles.padding(40),
    paddingHorizontal: responsiveStyles.padding(20),
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  pageTitle: {
    fontSize: responsiveStyles.fontSize(32),
    fontWeight: "bold",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: responsiveStyles.fontSize(16),
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 600,
  },

  // Tabs
  tabsContainer: {
    paddingHorizontal: responsiveStyles.padding(20),
    marginBottom: 20,
  },
  tabsScrollContent: {
    paddingHorizontal: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.selected,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
  },

  // Content
  contentContainer: {
    paddingHorizontal: responsiveStyles.padding(20),
    paddingBottom: 40,
  },
  tabContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: responsiveStyles.padding(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabDescription: {
    fontSize: responsiveStyles.fontSize(16),
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 32,
  },

  // Architecture
  architectureSection: {
    marginBottom: 32,
  },
  architectureSectionTitle: {
    fontSize: responsiveStyles.fontSize(20),
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  architectureItem: {
    backgroundColor: colors.surfaceElevated,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  architectureItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  architectureItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  architectureItemVersion: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  architectureItemDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Features
  featureSection: {
    marginBottom: 32,
  },
  featureSectionTitle: {
    fontSize: responsiveStyles.fontSize(18),
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  featureSectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  specificationsList: {
    gap: 8,
  },
  specificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  specificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 6,
    marginRight: 12,
  },
  specificationText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },

  // Security
  securitySection: {
    marginBottom: 32,
    backgroundColor: colors.surfaceElevated,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: responsiveStyles.fontSize(18),
    fontWeight: "bold",
    color: colors.text.primary,
  },
  securityLevel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  securityLevelText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.white,
  },
  securitySpecs: {
    gap: 12,
  },
  securitySpecItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  securitySpecText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },

  // Technical
  technicalSection: {
    marginBottom: 32,
  },
  technicalTitle: {
    fontSize: responsiveStyles.fontSize(18),
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  technicalDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
    fontStyle: "italic",
  },
  technicalDetails: {
    gap: 10,
  },
  technicalDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  technicalDetailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
    marginTop: 8,
    marginRight: 12,
  },
  technicalDetailText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },

  // Common Container
  containerMax: {
    maxWidth: responsiveStyles.maxWidth(),
    alignSelf: "center",
    width: responsiveStyles.pcWidth() as any,
  },
});

export default styles;



