import { StyleSheet, Platform } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: "100%", // ヘッダーを画面幅いっぱいに
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24, // もともと18、より大きく
    fontWeight: "bold",
    color: colors.text.primary,
  },
  signOutButton: {
    padding: 8,
  },
  serviceIntroButton: {
    padding: 8,
  },
  // 店舗切り替え関連のスタイル
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  storeButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: "600",
  },
  kanbanButton: {
    padding: 8,
    marginRight: 4,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.text.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  // モーダル関連のスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  storeModalContainer: {
    backgroundColor: colors.background,
    width: "80%",
    maxWidth: 400,
    borderRadius: 12,
    maxHeight: "70%",
  },
  storeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  storeList: {
    maxHeight: 300,
  },
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeItemSelected: {
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  storeItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  storeItemTextSelected: {
    color: colors.primary,
  },
  storeItemName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 8,
  },
  // 店舗管理オプション
  storeManagementOptions: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  managementOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  managementOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  managementOptionSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
