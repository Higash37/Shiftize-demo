import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  fixedHeader: {
    backgroundColor: "#ffffff",
    zIndex: 10,
  },

  breadcrumbOnlyHeader: {
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    zIndex: 10,
    minHeight: 64,
    maxHeight: 64,
  },

  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text.primary,
  },

  scrollableContent: {
    flex: 1,
  },

  mainContent: {
    flex: 1,
    flexDirection: "row",
    maxHeight: "100%",
  },

  fileArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  fileAreaContent: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: width < 480 ? 8 : width < 768 ? 12 : 16,
  },

  // グリッドレイアウト
  gridContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  gridContent: {
    padding: width < 480 ? 8 : width < 768 ? 12 : 16,
    paddingBottom: width < 480 ? 16 : 24,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: width < 480 ? 8 : width < 768 ? 12 : 16,
  },

  gridItem: {
    width: (() => {
      if (width < 480) {
        // 小さいモバイル: サイドバー120px、3列表示
        return (width - 120 - 24) / 3;
      } else if (width < 768) {
        // モバイル: サイドバー140px、3列表示
        return (width - 140 - 32) / 3;
      } else if (width < 1024) {
        // タブレット: サイドバー280px、4列表示
        return (width - 280 - 48) / 4;
      } else {
        // デスクトップ: サイドバー320px、5列表示
        return (width - 320 - 64) / 5;
      }
    })(),
    minWidth: width < 480 ? 80 : 100,
    maxWidth: width < 480 ? 110 : width < 768 ? 140 : 150,
  },

  // カード共通スタイル
  folderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: width < 768 ? 4 : width < 1024 ? 14 : 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e9ecef",
    height: width < 768 ? 95 : width < 1024 ? 160 : 180,
    width: "100%",
  },

  fileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: width < 768 ? 4 : width < 1024 ? 14 : 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e9ecef",
    height: width < 768 ? 95 : width < 1024 ? 160 : 180,
    width: "100%",
  },

  cardContent: {
    flex: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  fileIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },

  cardInfo: {
    flex: 1,
    alignItems: "center",
  },

  cardTitle: {
    fontSize: width < 768 ? 8 : width < 1024 ? 13 : 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: width < 768 ? 1 : 3,
    lineHeight: width < 768 ? 10 : width < 1024 ? 15 : 17,
    textAlign: "center",
    minHeight: width < 768 ? 30 : width < 1024 ? 45 : 51, // 3行分の高さを確保
  },

  cardSubtitle: {
    fontSize: width < 768 ? 7 : width < 1024 ? 10 : 11,
    color: colors.text.secondary,
    marginBottom: width < 768 ? 1 : 3,
    textAlign: "center",
  },

  cardDate: {
    fontSize: width < 768 ? 6 : width < 1024 ? 9 : 10,
    color: colors.text.secondary,
    textAlign: "center",
  },

  // パンくずリスト（エクスプローラー風）
  breadcrumbContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    minHeight: 48,
  },
  pathDisplay: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },

  pathScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: "100%",
  },

  printButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    justifyContent: "center",
  },

  printButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  pathIcon: {
    marginRight: 8,
  },
  pathSegments: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap", // 改行しないように変更
  },
  pathSegment: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    minWidth: 40, // 最小幅を設定
    height: 24,
    justifyContent: "center",
    flexShrink: 0, // 縮小しないように
  },
  pathSegmentText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  currentPathSegment: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
  },
  currentPathText: {
    color: colors.text.primary,
    fontWeight: "600",
  },
  pathSeparator: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 2,
    fontFamily: "monospace",
  },
  pathText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    fontFamily: "monospace", // フォント統一
  },
  breadcrumbNav: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 4,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  breadcrumbItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  breadcrumbText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  currentBreadcrumb: {
    color: colors.text.primary,
    fontWeight: "600",
  },

  // ツールバー
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  toolbarButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
  sortButton: {
    padding: 8,
    borderRadius: 4,
  },

  // リスト表示
  list: {
    flex: 1,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start", // 上揃えに変更
    paddingHorizontal: 16,
    paddingVertical: 20, // パディングを増やして4行表示に対応
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#ffffff",
    minHeight: 80, // 最小高さを4行分に増やす
  },

  selectedListItem: {
    backgroundColor: "#e3f2fd",
  },

  checkbox: {
    marginRight: 12,
    padding: 4,
    marginTop: 4, // 上揃えに調整
  },

  listIcon: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
    marginTop: 4, // 上揃えに調整
  },

  listContent: {
    flex: 2, // より多くのスペースを確保
    marginRight: 8, // マージンを少し縮小
    minWidth: 0, // flexで縮小可能にする
  },

  listTitle: {
    fontSize: 12, // 文字サイズを小さく
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 2,
    lineHeight: 16, // 2行表示用の行間調整
  },

  listSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },

  listDate: {
    fontSize: 12,
    color: colors.text.secondary,
    width: 60, // 幅を縮小
    textAlign: "right",
    marginRight: 8,
    flexShrink: 0, // 縮小しないように固定
    marginTop: 4, // 上揃えに調整
  },

  listType: {
    fontSize: 10,
    color: colors.text.secondary,
    width: 35, // 幅を縮小
    textAlign: "right",
    fontWeight: "500",
    flexShrink: 0, // 縮小しないように固定
    marginTop: 4, // 上揃えに調整
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  subFolderName: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: "400",
  },
  indentLine: {
    marginRight: 4,
    marginLeft: -4,
  },
  itemDetails: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  itemAction: {
    padding: 8,
    borderRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#f1f3f4",
    marginLeft: 64,
  },

  // 空の状態
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActions: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  emptyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    minWidth: 140,
    justifyContent: "center",
  },
  emptyActionButtonSecondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptyActionText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyActionTextSecondary: {
    color: colors.primary,
  },

  // ローディング
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },

  // レスポンシブ対応
  ...(width > 768 && {
    container: {
      maxWidth: 1200,
      alignSelf: "center",
      width: "100%",
    },
    itemContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    toolbar: {
      paddingHorizontal: 24,
    },
    breadcrumbContainer: {
      paddingHorizontal: 24,
    },
  }),

  // モバイル用縦一列アイコンバー
  mobileIconBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 20,
    zIndex: 5,
  },

  mobileIconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },

  hamburgerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
});
