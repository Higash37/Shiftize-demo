import { StyleSheet, Platform } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    backgroundColor: colors.header.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.header.separator,
    position: "relative",
    zIndex: 10,
    elevation: 4,
    ...(Platform.OS === "web" &&
      ({
        backdropFilter: "blur(18px)",
      } as any)),
    width: "100%", // ヘッダーを画面幅いっぱいに
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerCompact: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leftContainerCompact: {
    marginRight: 8,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightContainerCompact: {
    gap: 4,
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
  titleCompact: {
    fontSize: 20,
  },
  signOutButton: {
    padding: 8,
  },
  serviceIntroButton: {
    padding: 8,
  },
  compactActionButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
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
    flexShrink: 1,
  },
  storeButtonCompact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  storeButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  storeButtonTextCompact: {
    fontSize: 12,
  },
  kanbanButton: {
    padding: 8,
    marginRight: 4,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  lineNotificationButton: {
    padding: 8,
    marginRight: 4,
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
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  storeModalContainer: {
    backgroundColor: colors.surface,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.header.separator,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.header.separator,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.header.separator,
  },
  managementOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.header.separator,
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
