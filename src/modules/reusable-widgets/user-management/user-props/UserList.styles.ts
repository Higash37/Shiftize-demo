import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.medium,
    marginBottom: layout.padding.medium,
  },
  headerTablet: {
    gap: layout.padding.large,
    marginBottom: layout.padding.large,
  },
  headerDesktop: {
    gap: layout.padding.xlarge,
    marginBottom: layout.padding.xlarge,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    paddingHorizontal: layout.padding.medium,
    backgroundColor: colors.surface,
    fontSize: 16,
    ...shadows.small,
  },
  searchInputTablet: {
    height: 48,
    fontSize: 18,
    paddingHorizontal: layout.padding.large,
  },
  addButton: {
    minWidth: 80,
  },
  addButtonTablet: {
    minWidth: 140,
    paddingHorizontal: layout.padding.large,
  },
  list: {
    gap: layout.padding.small,
    paddingBottom: layout.padding.medium,
    paddingHorizontal: layout.padding.small,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    padding: layout.padding.small,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginHorizontal: 0,
    ...shadows.small,
  },
  userCardTablet: {
    maxWidth: 350,
  },
  userCardDesktop: {
    maxWidth: 280,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  iconContainer: {
    marginRight: layout.padding.small,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
  },
  userNameLarge: {
    fontSize: 14,
    fontWeight: "600",
  },
  userRole: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  passwordSection: {
    backgroundColor: colors.background,
    padding: layout.padding.small,
    borderRadius: layout.borderRadius.small,
    marginBottom: layout.padding.small,
    borderWidth: 1,
    borderColor: colors.border + "50",
  },
  passwordLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 2,
    fontWeight: "500",
  },
  passwordValue: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: "600",
    letterSpacing: 1,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    borderColor: colors.error,
    minWidth: 60,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.secondary,
    marginTop: layout.padding.xlarge,
    fontSize: 16,
    fontStyle: "italic",
  },
  columnWrapper: {
    gap: layout.padding.medium,
    justifyContent: "space-between",
  },
  columnWrapperDesktop: {
    gap: layout.padding.small,
    justifyContent: "flex-start",
  },

  // モーダルスタイル
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: layout.padding.xlarge,
    borderRadius: layout.borderRadius.large,
    minWidth: 300,
    maxWidth: "90%",
    ...shadows.large,
  },
  modalContentTablet: {
    minWidth: 400,
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: layout.padding.large,
    textAlign: "center",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: layout.padding.medium,
  },
  modalButton: {
    flex: 1,
  },
  deleteButtonModal: {
    backgroundColor: colors.error,
  },
});
