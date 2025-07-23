import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

const { width, height } = Dimensions.get("window");
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;
const sidebarHeight = height - 120; // アプリフッターとヘッダーとの間にスペースを確保

// レスポンシブな幅設定
const getSidebarWidth = () => {
  if (isMobile) return width < 480 ? 120 : 140; // 小さいモバイルは120px、通常モバイルは140px
  if (isTablet) return 280; // タブレットは280px
  return 320; // デスクトップは320px
};

export const styles = StyleSheet.create({
  container: {
    width: getSidebarWidth(),
    height: sidebarHeight,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
    flexDirection: "column",
    position: "relative",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: isMobile ? (width < 480 ? 8 : 12) : 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
    gap: isMobile ? 8 : 12, // ホームボタンとプラスボタンの間隔
  },

  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0, // flexで縮小可能にする
    marginRight: isMobile ? 4 : 8, // プラスボタンとの間隔
  },

  homeText: {
    fontSize: isMobile ? (width < 480 ? 10 : 12) : isTablet ? 16 : 18,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: isMobile ? 4 : 8,
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: isMobile ? 4 : 6,
  },

  actionButton: {
    padding: isMobile ? (width < 480 ? 6 : 8) : 8,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.primary,
    flexShrink: 0, // 縮小しないように固定
  },

  content: {
    flex: 1,
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: isMobile ? (width < 480 ? 9 : 10) : isTablet ? 12 : 14,
    fontWeight: "600",
    color: colors.text.secondary,
    textTransform: "uppercase",
    paddingHorizontal: isMobile ? (width < 480 ? 8 : 10) : isTablet ? 16 : 20,
    paddingVertical: isMobile ? 6 : 8,
    backgroundColor: "#f8f9fa",
  },

  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isMobile ? (width < 480 ? 8 : 12) : isTablet ? 16 : 20,
    paddingVertical: isMobile ? (width < 480 ? 4 : 6) : isTablet ? 8 : 10,
    minHeight: isMobile ? (width < 480 ? 28 : 32) : isTablet ? 36 : 40,
  },

  activeFolderItem: {
    backgroundColor: colors.primary + "15",
    borderRightWidth: 3,
    borderRightColor: colors.primary,
  },

  folderText: {
    fontSize: isMobile ? (width < 480 ? 10 : 11) : isTablet ? 14 : 16,
    color: colors.text.primary,
    marginLeft: isMobile ? (width < 480 ? 4 : 6) : 8,
    flex: 1,
  },

  activeFolderText: {
    color: colors.primary,
    fontWeight: "600",
  },

  folderCount: {
    fontSize: isMobile ? 10 : isTablet ? 12 : 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },

  quickNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    minHeight: 32,
    overflow: "hidden",
  },

  quickNavText: {
    fontSize: isMobile ? 11 : isTablet ? 13 : 15,
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },

  emptyText: {
    fontSize: isMobile ? 11 : isTablet ? 13 : 15,
    color: colors.text.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});
