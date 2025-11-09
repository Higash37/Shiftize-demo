import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;
const IS_PC = SCREEN_WIDTH > 1024;

export const recruitmentApplicationStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: IS_SMALL_DEVICE ? 12 : 16,
    ...(IS_PC && {
      maxWidth: '60%',
      alignSelf: 'center',
      width: '60%',
    }),
  },
  pageTitle: {
    fontSize: IS_SMALL_DEVICE ? 20 : 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: "center",
  },
  shiftCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftHeader: {
    marginBottom: 12,
  },
  shiftDate: {
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  shiftNotes: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  applicationSection: {
    marginTop: 16,
  },
  applicationLabel: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  optionText: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.primary,
  },
  timeChangeSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChangeLabel: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.surface,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.primary,
  },
  timeSeparator: {
    marginHorizontal: 8,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.secondary,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.surface,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: colors.text.primary,
    textAlignVertical: "top",
    minHeight: 60,
  },
  generalNotesSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  generalNotesLabel: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: IS_PC ? 14 : 16,
    paddingHorizontal: 24,
    borderRadius: IS_PC ? 10 : 12,
    marginTop: 24,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    minHeight: 48,
  },
  submitButtonDisabled: {
    backgroundColor: "#C7C7CC",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: colors.text.white,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
});