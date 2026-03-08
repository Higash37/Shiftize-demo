import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { responsive, responsiveStyles } from "./utils/responsive";

const palette = {
  shadow: "rgba(0, 0, 0, 0.12)",
  progressTrack: "rgba(60, 60, 67, 0.16)",
  progressBefore: "rgba(60, 60, 67, 0.38)",
  sectionSurface: "rgba(255, 255, 255, 0.85)",
};

export const createDevelopmentStoryStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: theme.colorScheme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      ...theme.typography.titleLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    scrollView: {
      flex: 1,
    },
    titleSection: {
      paddingVertical: responsiveStyles.padding(40),
      paddingHorizontal: responsiveStyles.padding(20),
      alignItems: "center",
      maxWidth: responsiveStyles.maxWidth(),
      alignSelf: "center",
      width: "100%",
    },
    pageTitle: {
      fontSize: responsiveStyles.fontSize(32),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 16,
      textAlign: "center",
    },
    pageSubtitle: {
      fontSize: responsiveStyles.fontSize(18),
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 26,
      maxWidth: responsive({
        mobile: "100%",
        tablet: "600px",
        desktop: "800px",
        default: "100%",
      }) as any,
    },
    timelineSection: {
      paddingHorizontal: 20,
      marginBottom: 40,
    },
    sectionTitle: {
      ...theme.typography.headlineSmall,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 8,
      textAlign: "center",
    },
    sectionSubtitle: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 24,
    },
    timelineItem: {
      marginBottom: 32,
      position: "relative",
    },
    phaseHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 12,
    },
    phaseNumber: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    phaseNumberText: {
      color: theme.colorScheme.onPrimary,
      ...theme.typography.titleMedium,
      fontWeight: "bold",
    },
    phaseInfo: {
      flex: 1,
    },
    phaseTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    phaseDuration: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
    },
    phaseDurationText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    phaseContent: {
      borderRadius: theme.shape.large,
      padding: 20,
      gap: 16,
      elevation: 0,
    },
    phaseDescription: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
      lineHeight: 22,
    },
    achievementsSection: {
      gap: 8,
    },
    achievementsTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
    },
    achievementItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    achievementDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
    },
    achievementText: {
      flex: 1,
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
      lineHeight: 20,
    },
    challengesSection: {
      gap: 6,
    },
    challengesTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
    },
    challengesText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 20,
    },
    timelineConnector: {
      position: "absolute",
      left: 21,
      top: "100%",
      width: 2,
      height: 24,
      backgroundColor: theme.colorScheme.outlineVariant,
    },
    learningSection: {
      paddingHorizontal: 20,
      marginBottom: 40,
    },
    skillsContainer: {
      gap: 20,
    },
    skillItem: {
      backgroundColor: palette.sectionSurface,
      borderRadius: theme.shape.large,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
    skillHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    skillName: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
    },
    skillGrowth: {
      ...theme.typography.bodyMedium,
      fontWeight: "500",
      color: theme.colorScheme.primary,
    },
    skillDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 12,
    },
    progressBars: {
      gap: 12,
    },
    progressBarRow: {
      gap: 8,
    },
    progressLabel: {
      ...theme.typography.bodySmall,
      fontWeight: "500",
      color: theme.colorScheme.onSurfaceVariant,
    },
    progressBarBg: {
      height: 8,
      borderRadius: 4,
      backgroundColor: palette.progressTrack,
      overflow: "hidden",
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    progressBarBefore: {
      backgroundColor: palette.progressBefore,
    },
    progressBarAfter: {
      backgroundColor: theme.colorScheme.primary,
    },
    insightsSection: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    insightsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 20,
      justifyContent: "center",
    },
    insightCard: {
      width: responsive({
        mobile: "100%",
        tablet: "45%",
        desktop: "30%",
        default: "100%",
      }),
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.large,
      padding: 24,
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      elevation: 0,
    },
    insightTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
      textAlign: "center",
    },
    insightDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 20,
      textAlign: "center",
    },
  });

export default createDevelopmentStoryStyles;
